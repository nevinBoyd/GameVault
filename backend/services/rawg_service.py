import os
import requests

from backend.models import db, Game

RAWG_BASE_URL = "https://api.rawg.io/api"
RAWG_API_KEY = os.getenv("RAWG_API_KEY")


class RAWGServiceError(Exception):
    pass


def _rawg_get(endpoint: str, params: dict) -> dict:
    """
    Internal helper to call RAWG and return JSON
    """
    if not RAWG_API_KEY:
        raise RAWGServiceError("RAWG_API_KEY is missing")

    url = f"{RAWG_BASE_URL}{endpoint}"
    full_params = {
        "key": RAWG_API_KEY,
        **params,
    }

    resp = requests.get(url, params=full_params)

    if resp.status_code != 200:
        raise RAWGServiceError(
            f"RAWG API error {resp.status_code}: {resp.text[:200]}"
        )

    return resp.json()


def get_games_page(page: int = 1, page_size: int = 40, **extra_params) -> dict:
    """
    Simple wrapper kept for /games/seed/test and other simple use cases.

    By default:
      - page_size = 40
      - accepts extra RAWG params (dates, ordering, tags, search, etc.)
    """
    payload = {
        "page": page,
        "page_size": page_size,
        **extra_params,
    }
    return _rawg_get("/games", payload)


def _extract_game_fields(rawg_game: dict) -> dict:
    """
    Normalize RAWG game JSON into our Game model fields.
    """
    # defensive get() calls; RAWG fields can be missing
    game_id = rawg_game.get("id")
    if game_id is None:
        raise RAWGServiceError("RAWG game missing 'id' field")

    name = rawg_game.get("name")
    slug = rawg_game.get("slug")

    # description_raw only present on detail endpoints, sometimes on list responses
    description = (
        rawg_game.get("description_raw")
        or rawg_game.get("description")
        or ""
    )

    image_url = rawg_game.get("background_image")
    released = rawg_game.get("released")
    rating = rawg_game.get("rating")

    platforms = []
    for p in rawg_game.get("platforms", []) or []:
        platform_info = p.get("platform") or {}
        if platform_info.get("name"):
            platforms.append(platform_info["name"])

    genres = []
    for g in rawg_game.get("genres", []) or []:
        if g.get("name"):
            genres.append(g["name"])

    return {
        "id": game_id,
        "title": name,
        "slug": slug,
        "description": description,
        "image_url": image_url,
        "released": released,
        "rating": rating,
        "platforms": platforms,
        "genres": genres,
    }

def _insert_or_skip_game(rawg_game: dict, seen_ids: set) -> tuple[int, int, int]:
    """
    Insert a game into DB if not already present.
    Keeps track of:
      - total_seen
      - inserted
      - skipped_existing
    """
    total_seen = 0
    inserted = 0
    skipped_existing = 0

    try:
        fields = _extract_game_fields(rawg_game)
    except RAWGServiceError:
        # Bad / incomplete record – just skip
        return (0, 0, 0)

    game_id = fields["id"]

    # count each unique RAWG entry attempt to process
    if game_id in seen_ids:
        total_seen += 1
        skipped_existing += 1
        return (total_seen, inserted, skipped_existing)

    seen_ids.add(game_id)
    total_seen += 1

    # If already in the DB, skip
    existing = Game.query.get(game_id)
    if existing:
        skipped_existing += 1
        return (total_seen, inserted, skipped_existing)

    game = Game(
        id=fields["id"],
        title=fields["title"],
        slug=fields["slug"],
        description=fields["description"],
        image_url=fields["image_url"],
        released=fields["released"],
        rating=fields["rating"],
        platforms=fields["platforms"],
        genres=fields["genres"],
    )

    db.session.add(game)
    inserted += 1

    return (total_seen, inserted, skipped_existing)


def seed_games() -> dict:
    """
    Expanded seeding system.

    - Keeps existing games in DB
    - Adds curated pages:
        * 2024 high-rated (2 pages)
        * 2025 high-rated (2 pages)
        * All-time top-rated (2 pages)
        * MMORPG-focused page
    - Plus targeted search for:
        * Diablo 4
        * Path of Exile
        * Path of Exile 2
        * Arc Raiders
    - Skips duplicates (both within this run and already in DB)

    Returns a summary dict consumed by /games/seed route:
      {
        "total": <int>,            # total RAWG items processed
        "inserted": <int>,         # actually inserted into DB
        "skipped_existing": <int>
      }
    """

    if not RAWG_API_KEY:
        raise RAWGServiceError("RAWG_API_KEY is missing")

    # Track seen IDs just during this run (on top of DB existence check)
    seen_ids: set[int] = set()

    total_seen = 0
    inserted = 0
    skipped_existing = 0

    # Curated page configs

    # 2024 & 2025 high-rated games (rating-desc)
    curated_pages = [
        # 2024
        {"label": "top_2024_page_1", "params": {"dates": "2024-01-01,2024-12-31", "ordering": "-rating", "page": 1}},
        {"label": "top_2024_page_2", "params": {"dates": "2024-01-01,2024-12-31", "ordering": "-rating", "page": 2}},
        # 2025 (some RAWG data may be sparse / upcoming titles)
        {"label": "top_2025_page_1", "params": {"dates": "2025-01-01,2025-12-31", "ordering": "-added", "page": 1}},
        {"label": "top_2025_page_2", "params": {"dates": "2025-01-01,2025-12-31", "ordering": "-added", "page": 2}},
        # All-time highly rated
        {"label": "top_all_time_page_1", "params": {"ordering": "-rating", "page": 1}},
        {"label": "top_all_time_page_2", "params": {"ordering": "-rating", "page": 2}},
        # MMORPG
        {"label": "mmorpg_page_1", "params": {"tags": "mmorpg", "ordering": "-rating", "page": 1}},
    ]

    for cfg in curated_pages:
        data = get_games_page(page=cfg["params"].get("page", 1), page_size=40, **{
            k: v for k, v in cfg["params"].items() if k != "page"
        })
        results = data.get("results") or []
        for rawg_game in results:
            t, i, s = _insert_or_skip_game(rawg_game, seen_ids)
            total_seen += t
            inserted += i
            skipped_existing += s

    #  Explicit target games by search term

    target_search_terms = [
        "Diablo 4",
        "Diablo IV",           # backup spellings
        "Path of Exile",
        "Path of Exile 2",
        "Arc Raiders",
    ]

    for term in target_search_terms:
        data = get_games_page(page=1, page_size=5, search=term)
        results = data.get("results") or []
        if not results:
            continue

        # take the best match (first)
        rawg_game = results[0]
        t, i, s = _insert_or_skip_game(rawg_game, seen_ids)
        total_seen += t
        inserted += i
        skipped_existing += s

    # Commit all changes once 
    db.session.commit()

    return {
        "total": total_seen,
        "inserted": inserted,
        "skipped_existing": skipped_existing,
    }

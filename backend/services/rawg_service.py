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
    BY DEFAULT:
    - Fetches RAWG /games listing
    - Supports ordering, search, tags, date filters
    """
    payload = {
        "page": page,
        "page_size": page_size,
        **extra_params,
    }
    return _rawg_get("/games", payload)

def get_game_details(game_id: int) -> dict:
    """
    Fetch full RAWG data for a single game.
    Required because /games listing often lacks full description/platforms.
    """
    return _rawg_get(f"/games/{game_id}", {})

def _extract_game_fields(rawg_game: dict) -> dict:
    """
    Normalize RAWG game JSON into our Game model fields.
    """
    game_id = rawg_game.get("id")
    if game_id is None:
        raise RAWGServiceError("RAWG game missing 'id' field")

    name = rawg_game.get("name")
    slug = rawg_game.get("slug")

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
    Tracks:
      total_seen
      inserted
      skipped_existing
    """
    total_seen = 0
    inserted = 0
    skipped_existing = 0

    try:
        fields = _extract_game_fields(rawg_game)
    except RAWGServiceError:
        return (0, 0, 0)

    game_id = fields["id"]

    if game_id in seen_ids:
        total_seen += 1
        skipped_existing += 1
        return (total_seen, inserted, skipped_existing)

    seen_ids.add(game_id)
    total_seen += 1

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
    Adds curated pages + searched titles.
    Preserves existing DB.
    """
    if not RAWG_API_KEY:
        raise RAWGServiceError("RAWG_API_KEY is missing")

    seen_ids: set[int] = set()

    total_seen = 0
    inserted = 0
    skipped_existing = 0

    curated_pages = [
        {"params": {"dates": "2024-01-01,2024-12-31", "ordering": "-rating", "page": 1}},
        {"params": {"dates": "2024-01-01,2024-12-31", "ordering": "-rating", "page": 2}},
        {"params": {"dates": "2025-01-01,2025-12-31", "ordering": "-added", "page": 1}},
        {"params": {"dates": "2025-01-01,2025-12-31", "ordering": "-added", "page": 2}},
        {"params": {"ordering": "-rating", "page": 1}},
        {"params": {"ordering": "-rating", "page": 2}},
        {"params": {"tags": "mmorpg", "ordering": "-rating", "page": 1}},
    ]

    for cfg in curated_pages:
        data = get_games_page(
            page=cfg["params"].get("page", 1),
            page_size=40,
            **{k: v for k, v in cfg["params"].items() if k != "page"}
        )

        results = data.get("results") or []
        for rawg_game in results:
            t, i, s = _insert_or_skip_game(rawg_game, seen_ids)
            total_seen += t
            inserted += i
            skipped_existing += s

    target_search_terms = [
        "Diablo 4",
        "Diablo IV",
        "Path of Exile",
        "Path of Exile 2",
        "Arc Raiders",
    ]

    for term in target_search_terms:
        data = get_games_page(page=1, page_size=5, search=term)
        results = data.get("results") or []
        if not results:
            continue

        rawg_game = results[0]
        t, i, s = _insert_or_skip_game(rawg_game, seen_ids)
        total_seen += t
        inserted += i
        skipped_existing += s

    db.session.commit()

    return {
        "total": total_seen,
        "inserted": inserted,
        "skipped_existing": skipped_existing,
    }

#   ENRICH EXISTING GAMES
def enrich_existing_games() -> dict:
    """
    Goes through DB games and fills missing:
      - description
      - platforms
      - genres

    Only updates games missing data.
    """
    games = Game.query.all()

    updated = 0
    skipped = 0
    failed = 0

    for g in games:
        needs_update = False

        if not g.description or g.description.strip() == "":
            needs_update = True
        if not g.platforms:
            needs_update = True
        if not g.genres:
            needs_update = True

        if not needs_update:
            skipped += 1
            continue

        try:
            data = get_game_details(g.id)

            g.description = (
                data.get("description_raw")
                or data.get("description")
                or g.description
                or ""
            )

            platforms = []
            for p in (data.get("platforms") or []):
                plat = p.get("platform") or {}
                if plat.get("name"):
                    platforms.append(plat["name"])
            if platforms:
                g.platforms = platforms

            genres = []
            for ge in (data.get("genres") or []):
                if ge.get("name"):
                    genres.append(ge["name"])
            if genres:
                g.genres = genres

            updated += 1

        except Exception:
            failed += 1
            continue

    db.session.commit()

    return {
        "updated": updated,
        "skipped": skipped,
        "failed": failed,
        "total": len(games),
    }

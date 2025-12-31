import os
import requests
from backend.models import db, Game

RAWG_BASE_URL = "https://api.rawg.io/api"
RAWG_API_KEY = os.getenv("RAWG_API_KEY")


class RAWGServiceError(Exception):
    pass


def get_games_page(page=1, page_size=40):
    """
    Fetches a page of RAWG games (list data).
    Does NOT include full descriptions — just the index list.
    """
    
    if not RAWG_API_KEY:
        raise RAWGServiceError("RAWG_API_KEY is missing")

    url = f"{RAWG_BASE_URL}/games"
    params = {
        "key": RAWG_API_KEY,
        "page": page,
        "page_size": page_size
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise RAWGServiceError(f"RAWG API error: {response.status_code}")

    return response.json()


def seed_games(limit=40):
    """
    Fetch RAWG games + their detailed info,
    insert into our database if not already present.
    Safe to run multiple times (skips existing).
    """

    data = get_games_page()
    results = data.get("results", [])

    created = 0
    skipped = 0

    for g in results[:limit]:
        slug = g.get("slug")
        if not slug:
            continue

        # Skip if already exists
        existing = Game.query.filter_by(slug=slug).first()
        if existing:
            skipped += 1
            continue

        # Fetch detailed game data
        detail_url = f"{RAWG_BASE_URL}/games/{slug}"
        detail_res = requests.get(detail_url, params={"key": RAWG_API_KEY})

        if detail_res.status_code != 200:
            continue

        detail = detail_res.json()

        game = Game(
            id=detail.get("id"),
            title=detail.get("name"),
            slug=detail.get("slug"),
            description=detail.get("description_raw"),
            image_url=detail.get("background_image"),
            released=detail.get("released"),
            rating=detail.get("rating"),
            platforms=[p["platform"]["name"] for p in detail.get("platforms", [])],
            genres=[g["name"] for g in detail.get("genres", [])],
        )

        db.session.add(game)
        created += 1

    db.session.commit()

    return {
        "created": created,
        "skipped": skipped,
        "total": created + skipped
    }

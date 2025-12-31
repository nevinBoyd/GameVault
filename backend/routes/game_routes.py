from flask import Blueprint, jsonify
from flask import request
from backend.services.rawg_service import get_games_page, seed_games
from backend.models import Game

game_bp = Blueprint("games", __name__, url_prefix="/games")

@game_bp.get("/health")
def games_health():
    return {"status": "ok", "scope": "games"}


@game_bp.get("/seed/test")
def test_seed_connection():
    try:
        data = get_games_page()
        return jsonify({
            "status": "ok",
            "count": len(data.get("results", []))
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@game_bp.post("/seed")
def seed_games_route():
    try:
        result = seed_games()
        return jsonify({
            "status": "ok",
            **result
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@game_bp.get("")
def get_games():
    genre = request.args.get("genre")
    platform = request.args.get("platform")
    sort = request.args.get("sort", "rating")
    limit = request.args.get("limit", type=int)

    games = Game.query.all()

    # Filtering
    if genre:
        games = [g for g in games if g.genres and genre in g.genres]

    if platform:
        games = [g for g in games if g.platforms and platform in g.platforms]

    # Sorting
    if sort == "rating":
        games = sorted(games, key=lambda g: g.rating or 0, reverse=True)
    elif sort == "title":
        games = sorted(games, key=lambda g: g.title.lower())

    # Limit
    if limit:
        games = games[:limit]

    return jsonify([
        {
            "id": g.id,
            "title": g.title,
            "image_url": g.image_url,
            "rating": g.rating,
            "genres": g.genres or [],
            "platforms": g.platforms or []
        }
        for g in games
    ])

@game_bp.get("/<int:game_id>")
def get_game(game_id):
    game = Game.query.get(game_id)

    if not game:
        return jsonify({"error": "Game not found"}), 404

    return jsonify({
        "id": game.id,
        "title": game.title,
        "slug": game.slug,
        "description": game.description,
        "image_url": game.image_url,
        "released": game.released,
        "rating": game.rating,
        "platforms": game.platforms or [],
        "genres": game.genres or []
    })

@game_bp.get("/categories")
def get_categories():
    games = Game.query.all()

    genres = {}

    for g in games:
        if g.genres:
            for genre in g.genres:
                genres[genre] = genres.get(genre, 0) + 1

    with_counts = request.args.get("withCounts") == "true"

    if with_counts:
        return jsonify([
            {"name": name, "count": count}
            for name, count in sorted(genres.items())
        ])

    return jsonify(sorted(list(genres.keys())))

@game_bp.get("/platforms")
def get_platforms():
    games = Game.query.all()

    platforms = set()

    for g in games:
        if g.platforms:
            for p in g.platforms:
                platforms.add(p)

    return jsonify(sorted(list(platforms)))

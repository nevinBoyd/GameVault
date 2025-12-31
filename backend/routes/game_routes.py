from flask import Blueprint, jsonify
from backend.services.rawg_service import get_games_page, seed_games

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

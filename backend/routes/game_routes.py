from flask import Blueprint

game_bp = Blueprint("games", __name__, url_prefix="/games")

@game_bp.get("/health")
def games_health():
    return {"status": "ok", "scope": "games"}

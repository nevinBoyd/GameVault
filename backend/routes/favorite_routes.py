from flask import Blueprint

favorite_bp = Blueprint("favorites", __name__, url_prefix="/favorites")

@favorite_bp.get("/health")
def favorites_health():
    return {"status": "ok", "scope": "favorites"}

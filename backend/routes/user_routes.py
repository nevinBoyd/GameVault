from flask import Blueprint, jsonify
from backend.models import User, Favorite, Game
from backend.routes.auth_routes import get_logged_in_user

user_bp = Blueprint("users", __name__, url_prefix="/users")

@user_bp.get("/me/favorites")
def get_my_favorites():
    user = get_logged_in_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    favorites = (
        Game.query
        .join(Favorite, Favorite.game_id == Game.id)
        .filter(Favorite.user_id == user.id)
        .all()
    )

    return jsonify([
        {
            "id": g.id,
            "title": g.title,
            "image_url": g.image_url,
            "rating": g.rating
        }
        for g in favorites
    ])


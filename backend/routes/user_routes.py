from flask import Blueprint, jsonify
from backend.models import User, Favorite, Game

user_bp = Blueprint("users", __name__, url_prefix="/users")


@user_bp.get("/me/favorites")
def get_my_favorites():
    user = User.query.first()
    if not user:
        return jsonify({"error": "No users available"}), 400

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

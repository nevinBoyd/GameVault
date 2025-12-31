from flask import Blueprint, jsonify
from backend.models import db, Favorite, Game
from backend.routes.auth_routes import get_logged_in_user

favorite_bp = Blueprint("favorites", __name__, url_prefix="/games")

# POST /games/:id/favorite
@favorite_bp.post("/<int:game_id>/favorite")
def add_favorite(game_id):
    user = get_logged_in_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    game = Game.query.get(game_id)
    if not game:
        return jsonify({"error": "Game not found"}), 404

    exists = Favorite.query.filter_by(user_id=user.id, game_id=game_id).first()
    if exists:
        return jsonify({"status": "already_favorited"}), 200

    fav = Favorite(user_id=user.id, game_id=game_id)
    db.session.add(fav)
    db.session.commit()

    return jsonify({"status": "favorited"}), 201

# DELETE /games/:id/favorite
@favorite_bp.delete("/<int:game_id>/favorite")
def remove_favorite(game_id):
    user = get_logged_in_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    fav = Favorite.query.filter_by(user_id=user.id, game_id=game_id).first()
    if not fav:
        return jsonify({"error": "Not favorited"}), 404

    db.session.delete(fav)
    db.session.commit()

    return jsonify({"status": "removed"}), 200

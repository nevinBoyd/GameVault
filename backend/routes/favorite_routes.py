from flask import Blueprint, jsonify
from backend.models import db, Favorite, Game, User

favorite_bp = Blueprint("favorites", __name__, url_prefix="/games")

# POST /games/:id/favorite
@favorite_bp.post("/<int:game_id>/favorite")
def add_favorite(game_id):
    game = Game.query.get(game_id)
    if not game:
        return jsonify({"error": "Game not found"}), 404

    user = User.query.first()
    if not user:
        return jsonify({"error": "No users available"}), 400

    existing = Favorite.query.filter_by(
        user_id=user.id,
        game_id=game_id
    ).first()

    if existing:
        return jsonify({"message": "Already favorited"}), 200

    fav = Favorite(user_id=user.id, game_id=game_id)
    db.session.add(fav)
    db.session.commit()

    return jsonify({"status": "favorited"}), 201

# DELETE /games/:id/favorite
@favorite_bp.delete("/<int:game_id>/favorite")
def remove_favorite(game_id):
    user = User.query.first()
    if not user:
        return jsonify({"error": "No users available"}), 400

    favorite = Favorite.query.filter_by(
        user_id=user.id,
        game_id=game_id
    ).first()

    if not favorite:
        return jsonify({"error": "Not in favorites"}), 404

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({"status": "removed"})

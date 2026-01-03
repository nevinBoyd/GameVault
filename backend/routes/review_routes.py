from flask import Blueprint, request, jsonify
from backend.models import db, Review, Game
from backend.routes.auth_routes import get_logged_in_user

review_bp = Blueprint("reviews", __name__, url_prefix="/games")

# GET /games/:id/reviews
@review_bp.get("/<int:game_id>/reviews")
def get_reviews(game_id):
    game = Game.query.get(game_id)

    if not game:
        return jsonify({"error": "Game not found"}), 404

    reviews = (
        Review.query
        .filter_by(game_id=game_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return jsonify([
        {
            "id": r.id,
            "content": r.content,
            "score": r.score,
            "created_at": r.created_at.isoformat(),
            "user": r.user.username if r.user else "Unknown"
        }
        for r in reviews
    ])

# POST /games/:id/reviews
@review_bp.post("/<int:game_id>/reviews")
def add_review(game_id):
    game = Game.query.get(game_id)
    if not game:
        return jsonify({"error": "Game not found"}), 404

    user = get_logged_in_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    data = request.get_json() or {}
    content = data.get("content")
    score = data.get("score")

    if not content or score is None:
        return jsonify({"error": "content and score required"}), 400

    if not isinstance(score, int) or score < 1 or score > 5:
        return jsonify({"error": "score must be 1-5"}), 400

    existing = Review.query.filter_by(user_id=user.id, game_id=game_id).first()
    if existing:
        return jsonify({"error": "You already reviewed this game"}), 400

    review = Review(
        content=content,
        score=score,
        user_id=user.id,
        game_id=game_id,
    )

    db.session.add(review)
    db.session.commit()

    return jsonify({
        "id": review.id,
        "content": review.content,
        "score": review.score,
        "user": user.username,
        "created_at": review.created_at.isoformat()
    }), 201

# PUT /games/:game_id/reviews/:review_id
@review_bp.put("/<int:game_id>/reviews/<int:review_id>")
def update_review(game_id, review_id):
    game = Game.query.get(game_id)
    if not game:
        return jsonify({"error": "Game not found"}), 404

    review = Review.query.get(review_id)
    if not review or review.game_id != game_id:
        return jsonify({"error": "Review not found"}), 404

    user = get_logged_in_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401
    
    if review.user_id != user.id:
        return jsonify({"error": "Not allowed"}), 403
    
    data = request.get_json() or {}
    content = data.get("content")
    score = data.get("score")

    if content:
        review.content = content

    if score is not None:
        if not isinstance(score, int) or score < 1 or score > 5:
            return jsonify({"error": "score must be 1-5"}), 400
        review.score = score

    db.session.commit()

    return jsonify({
        "id": review.id,
        "content": review.content,
        "score": review.score,
        "user": review.user.username,
        "created_at": review.created_at.isoformat()
    })

# DELETE /games/:game_id/reviews/:review_id
@review_bp.delete("/<int:game_id>/reviews/<int:review_id>")
def delete_review(game_id, review_id):
    game = Game.query.get(game_id)
    if not game:
        return jsonify({"error": "Game not found"}), 404

    review = Review.query.get(review_id)
    if not review or review.game_id != game_id:
        return jsonify({"error": "Review not found"}), 404
    
    user = get_logged_in_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    # Ownership enforcement
    if review.user_id != user.id:
        return jsonify({"error": "Not allowed"}), 403


    db.session.delete(review)
    db.session.commit()

    return jsonify({"status": "deleted"})

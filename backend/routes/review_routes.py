from flask import Blueprint

review_bp = Blueprint("reviews", __name__, url_prefix="/reviews")

@review_bp.get("/health")
def reviews_health():
    return {"status": "ok", "scope": "reviews"}

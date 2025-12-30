from flask import Blueprint

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.get("/health")
def auth_health():
    return {"status": "ok", "scope": "auth"}

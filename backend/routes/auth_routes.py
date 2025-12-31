from flask import Blueprint, request, session, jsonify
from backend.models import db, User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# Shared helper used by Reviews and Favorites
def get_logged_in_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return User.query.get(user_id)

# Register
@auth_bp.post("/register")
def register():
    data = request.get_json() or {}

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "username, email and password required"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "User already exists"}), 400

    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    }), 201

# Login
@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    session["user_id"] = user.id

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    }), 200

# User
@auth_bp.get("/me")
def me():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"user": None}), 200

    user = User.query.get(user_id)

    if not user:
        session.clear()
        return jsonify({"user": None}), 200

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    }), 200

# Logout
@auth_bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"status": "logged_out"}), 200

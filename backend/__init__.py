from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_migrate import Migrate
from .models import db
from .routes import (
    auth_bp,
    game_bp,
    review_bp,
    favorite_bp,
    user_bp
)
from flask_bcrypt import Bcrypt

migrate = Migrate()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///gamevault.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False
    app.config["SECRET_KEY"] = "dev-secret-do-not-use-production"
    app.config["SESSION_COOKIE_NAME"] = "gamevault_session"

    db.init_app(app)
    bcrypt.init_app(app)

    from . import models

    migrate.init_app(app, db)

    app.register_blueprint(auth_bp)
    app.register_blueprint(game_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(favorite_bp)
    app.register_blueprint(user_bp)

    return app

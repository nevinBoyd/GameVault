from flask import Flask
from flask_migrate import Migrate
from .models import db
from .routes import (
    auth_bp,
    game_bp,
    review_bp,
    favorite_bp
)

migrate = Migrate()

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///gamevault.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False

    db.init_app(app)

    from . import models

    migrate.init_app(app, db)

    app.register_blueprint(auth_bp)
    app.register_blueprint(game_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(favorite_bp)
    
    return app

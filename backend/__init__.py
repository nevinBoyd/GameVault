from flask import Flask
from flask_migrate import Migrate
from .models import db

migrate = None

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///gamevault.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False

    db.init_app(app)

    from . import models

    migrate = Migrate(app, db)

    return app

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy import UniqueConstraint

db = SQLAlchemy()


class User(db.Model):
    """
    Application user account.

    Notes:
    - Username and email are unique identifiers
    - Related reviews and favorites are deleted automatically if the user is removed
    """
    
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    reviews = db.relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    favorites = db.relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Game(db.Model):
    """
    Represents a game entry in the system.

    Notes:
    - Uses the RAWG game ID as the primary key so records stay aligned
      with the external source.
    - Platforms and genres are stored as simple JSON arrays to allow flexible
      structure without requiring additional relational tables.
    """

    __tablename__ = "games"

    # RAWG game ID is used as the canonical primary key
    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String, nullable=False)
    slug = db.Column(db.String, nullable=False, unique=True)

    description = db.Column(db.Text)    # Full RAWG description_raw
    image_url = db.Column(db.String)
    released = db.Column(db.String)     # RAWG date format varies; store raw
    rating = db.Column(db.Float)

    platforms = db.Column(JSON)         # e.g., ["PC", "PS5", "Xbox"]
    genres = db.Column(JSON)            # e.g., ["Action", "RPG"]

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    reviews = db.relationship(
        "Review",
        back_populates="game",
        cascade="all, delete-orphan"
    )

    favorites = db.relationship(
        "Favorite",
        back_populates="game",
        cascade="all, delete-orphan"
    )


class Review(db.Model):
    """
    User-submitted review for a game.

    Constraints:
    - A user may only review a given game once
    - Reviews are deleted if either the user or game is removed
    """

    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)

    content = db.Column(db.Text, nullable=False)
    score = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey("games.id"), nullable=False)

    user = db.relationship("User", back_populates="reviews")
    game = db.relationship("Game", back_populates="reviews")

    # Enforce 1 review per game per user
    __table_args__ = (
        UniqueConstraint("user_id", "game_id", name="uq_review_user_game"),
    )


class Favorite(db.Model):
    """
    Join table representing a user's favorited games.

    Constraints:
    - A user may only favorite a given game once (enforced via unique pair)
    - Favorites are removed automatically if the user or game is deleted
    """
   
    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey("games.id"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="favorites")
    game = db.relationship("Game", back_populates="favorites")

    # Prevent duplicate favorites
    __table_args__ = (
        UniqueConstraint("user_id", "game_id", name="uq_favorite_user_game"),
    )

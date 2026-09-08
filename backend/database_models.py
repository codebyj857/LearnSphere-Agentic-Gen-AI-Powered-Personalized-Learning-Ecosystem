"""SQLAlchemy ORM schema for the LearnSphere backend.

Provides a complete, standalone object-relational mapping for the ``Users``,
``Conversations`` and ``Analytics`` tables. All queries are expressed through
the ORM (or bound SQLAlchemy parameters) so user input can never be string-
interpolated into SQL, mitigating SQL-injection risk by construction.

This module is intentionally NOT imported by ``app_simple.py``; it exists as a
reference/upgrade layer for the production database layer.
"""

from __future__ import annotations

from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


def utcnow() -> datetime:
    """Return the current UTC timestamp.

    Returns
    -------
    datetime
        Timezone-aware current UTC time.
    """
    return datetime.now(timezone.utc)


class User(db.Model):
    """Authenticable platform user.

    Passwords are stored as Werkzeug bcrypt-style hash digests; plaintext
    credentials are never persisted.
    """

    __tablename__ = "Users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    conversations = db.relationship(
        "Conversation", back_populates="user", cascade="all, delete-orphan"
    )

    def set_password(self, password: str) -> None:
        """Hash and store a plaintext password.

        Parameters
        ----------
        password:
            The plaintext password supplied by the user.
        """
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify a supplied password against the stored hash.

        Parameters
        ----------
        password:
            The plaintext candidate password.

        Returns
        -------
        bool
            ``True`` if the candidate matches, ``False`` otherwise.
        """
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        """Serialise the user record for API responses.

        Returns
        -------
        dict
            User attributes without the password hash.
        """
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class Conversation(db.Model):
    """A chat/roadmap conversation belonging to a user."""

    __tablename__ = "Conversations"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("Users.id"), nullable=False, index=True)
    topic = db.Column(db.String(200), nullable=False)
    roadmap_payload = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    user = db.relationship("User", back_populates="conversations")

    def to_dict(self) -> dict:
        """Serialise the conversation for API responses.

        Returns
        -------
        dict
            Conversation attributes.
        """
        return {
            "id": self.id,
            "user_id": self.user_id,
            "topic": self.topic,
            "created_at": self.created_at.isoformat(),
        }


class Analytics(db.Model):
    """Aggregated learner analytics / session event record."""

    __tablename__ = "Analytics"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("Users.id"), nullable=True, index=True)
    event_type = db.Column(db.String(80), nullable=False)
    metric_json = db.Column(db.Text, nullable=True)
    recorded_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    user = db.relationship("User", foreign_keys=[user_id])

    def to_dict(self) -> dict:
        """Serialise an analytics record for API responses.

        Returns
        -------
        dict
            Analytics attributes.
        """
        return {
            "id": self.id,
            "user_id": self.user_id,
            "event_type": self.event_type,
            "recorded_at": self.recorded_at.isoformat(),
        }


def init_db(app) -> None:
    """Initialise the SQLAlchemy instance against a Flask app.

    Parameters
    ----------
    app:
        The Flask application instance to bind the database to.
    """
    db.init_app(app)
    with app.app_context():
        db.create_all()


def find_user_by_email(email: str) -> User | None:
    """Look up a user by email using bound parameters (injection-safe).

    Parameters
    ----------
    email:
        The email address to search for.

    Returns
    -------
    User | None
        The matching user record, or ``None`` if not found.
    """
    return User.query.filter_by(email=email).first()


def find_user_by_id(user_id: int) -> User | None:
    """Look up a user by primary key.

    Parameters
    ----------
    user_id:
        The user's numeric identifier.

    Returns
    -------
    User | None
        The matching user record, or ``None`` if not found.
    """
    return db.session.get(User, user_id)
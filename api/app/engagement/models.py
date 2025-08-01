from app.extensions import db
from datetime import datetime

# Gamification Models
class Score(db.Model):
    __tablename__ = 'score'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    points = db.Column(db.Integer, default=0)

class Badge(db.Model):
    __tablename__ = 'badge'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    icon_url = db.Column(db.String(255))

class UserBadge(db.Model):
    __tablename__ = 'user_badge'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    badge_id = db.Column(db.Integer, db.ForeignKey('badge.id'))
    awarded_at = db.Column(db.DateTime, default=datetime.utcnow)
    badge = db.relationship('Badge')

# Progress Models
class Progress(db.Model):
    __tablename__ = 'progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    current_level = db.Column(db.String(100))
    completed_lessons = db.Column(db.PickleType)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Notification Models
class Notification(db.Model):
    __tablename__ = 'notification'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notify_at = db.Column(db.DateTime)
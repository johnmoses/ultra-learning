from app.extensions import db
from datetime import datetime

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

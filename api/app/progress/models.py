from app.extensions import db
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

class Progress(db.Model):
    __tablename__ = 'progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    current_level = db.Column(db.String(100))
    completed_lessons = db.Column(db.PickleType)  # List of lesson/flashcard pack IDs
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

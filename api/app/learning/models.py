from app.extensions import db
from datetime import datetime

class StudySession(db.Model):
    __tablename__ = 'study_session'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # in seconds
    subject = db.Column(db.String(120), nullable=False)
    completed = db.Column(db.Boolean, default=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class FlashcardPack(db.Model):
    __tablename__ = 'flashcard_pack'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    flashcards = db.relationship('Flashcard', backref='pack', cascade='all, delete-orphan', lazy=True)

class Flashcard(db.Model):
    __tablename__ = 'flashcard'
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255), nullable=False)
    answer = db.Column(db.String(255), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pack_id = db.Column(db.Integer, db.ForeignKey('flashcard_pack.id'), nullable=True)
    next_review = db.Column(db.DateTime)
    image_url = db.Column(db.String(255))
    audio_url = db.Column(db.String(255))

from app.extensions import db
from datetime import datetime

class UserActivity(db.Model):
    __tablename__ = 'user_activity'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)  # page_view, button_click, session_start, etc.
    page_url = db.Column(db.String(255))
    element_id = db.Column(db.String(100))  # button id, link id, etc.
    extra_data = db.Column(db.JSON)  # additional data (renamed from metadata)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.String(100))  # track user sessions


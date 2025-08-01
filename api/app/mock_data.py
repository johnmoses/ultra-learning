from app.extensions import db
from app.auth.models import User
from app.learning.models import Flashcard, FlashcardPack
from app.engagement.models import Score, Badge, UserBadge, Progress, Notification
from app.chat.models import ChatRoom, ChatMessage, ChatParticipant
from app.dashboard.models import UserActivity
from app.learning.models import StudySession
from datetime import datetime, timedelta
import random

class MockDataManager:
    def __init__(self):
        self.created_objects = []
    
    def seed_all(self):
        """Seed all mock data"""
        self.seed_users()
        self.seed_learning_data()
        self.seed_engagement_data()
        self.seed_chat_data()
        self.seed_dashboard_data()
        db.session.commit()
        return len(self.created_objects)
    
    def seed_users(self):
        """Create test users"""
        users_data = [
            {"username": "alice", "email": "alice@test.com", "role": "user"},
            {"username": "bob", "email": "bob@test.com", "role": "user"},
            {"username": "charlie", "email": "charlie@test.com", "role": "admin"}
        ]
        
        for user_data in users_data:
            if not User.query.filter_by(username=user_data["username"]).first():
                user = User(**user_data)
                user.set_password("testpass123")
                db.session.add(user)
                self.created_objects.append(user)
    
    def seed_learning_data(self):
        """Create flashcard packs and cards"""
        users = User.query.filter(User.username.in_(["alice", "bob"])).all()
        if not users:
            return
        
        # Create packs
        packs_data = [
            {"title": "Python Basics", "description": "Fundamental Python concepts", "owner_id": users[0].id},
            {"title": "Data Structures", "description": "Lists, dicts, sets", "owner_id": users[0].id},
            {"title": "Web Development", "description": "Flask and APIs", "owner_id": users[1].id}
        ]
        
        for pack_data in packs_data:
            pack = FlashcardPack(**pack_data)
            db.session.add(pack)
            self.created_objects.append(pack)
            db.session.flush()  # Get ID
            
            # Create flashcards for each pack
            cards_data = [
                {"question": f"What is {pack.title} concept 1?", "answer": f"Answer about {pack.title}", "owner_id": pack.owner_id, "pack_id": pack.id},
                {"question": f"How does {pack.title} work?", "answer": f"Explanation of {pack.title}", "owner_id": pack.owner_id, "pack_id": pack.id}
            ]
            
            for card_data in cards_data:
                card = Flashcard(**card_data)
                db.session.add(card)
                self.created_objects.append(card)
    
    def seed_engagement_data(self):
        """Create gamification and progress data"""
        users = User.query.filter(User.username.in_(["alice", "bob"])).all()
        if not users:
            return
        
        # Create badges
        badges_data = [
            {"name": "First Steps", "description": "Complete first lesson", "icon_url": "/icons/first.png"},
            {"name": "Study Streak", "description": "7 days in a row", "icon_url": "/icons/streak.png"}
        ]
        
        for badge_data in badges_data:
            badge = Badge(**badge_data)
            db.session.add(badge)
            self.created_objects.append(badge)
        
        db.session.flush()
        
        # Create user scores and progress
        for user in users:
            score = Score(user_id=user.id, points=random.randint(100, 1000))
            progress = Progress(user_id=user.id, current_level="Beginner", completed_lessons=[1, 2, 3])
            notification = Notification(user_id=user.id, message=f"Welcome {user.username}!")
            
            db.session.add_all([score, progress, notification])
            self.created_objects.extend([score, progress, notification])
    
    def seed_chat_data(self):
        """Create chat rooms and messages"""
        users = User.query.filter(User.username.in_(["alice", "bob"])).all()
        if not users:
            return
        
        # Create chat room
        room = ChatRoom(name="Study Group")
        db.session.add(room)
        self.created_objects.append(room)
        db.session.flush()
        
        # Add participants
        for user in users:
            participant = ChatParticipant(room_id=room.id, user_id=user.id)
            db.session.add(participant)
            self.created_objects.append(participant)
        
        # Create messages
        messages_data = [
            {"room_id": room.id, "sender_id": users[0].id, "content": "Hello everyone!", "role": "user"},
            {"room_id": room.id, "sender_id": users[1].id, "content": "Hi! Ready to study?", "role": "user"}
        ]
        
        for msg_data in messages_data:
            message = ChatMessage(**msg_data)
            db.session.add(message)
            self.created_objects.append(message)
    
    def seed_dashboard_data(self):
        """Create activity tracking and study sessions"""
        users = User.query.filter(User.username.in_(["alice", "bob"])).all()
        if not users:
            return
        
        # Create user activities
        activities = [
            {"user_id": users[0].id, "activity_type": "page_view", "page_url": "/flashcards", "session_id": "sess_1"},
            {"user_id": users[0].id, "activity_type": "button_click", "element_id": "create-btn", "page_url": "/flashcards"},
            {"user_id": users[1].id, "activity_type": "page_view", "page_url": "/dashboard", "session_id": "sess_2"}
        ]
        
        for activity_data in activities:
            activity = UserActivity(**activity_data)
            db.session.add(activity)
            self.created_objects.append(activity)
        
        # Create study sessions
        sessions = [
            {"user_id": users[0].id, "subject": "Python", "duration": 2700, "completed": True},  # 45 minutes in seconds
            {"user_id": users[1].id, "subject": "Math", "duration": 1800, "completed": True}  # 30 minutes in seconds
        ]
        
        for session_data in sessions:
            session = StudySession(**session_data)
            db.session.add(session)
            self.created_objects.append(session)
    
    def flush_all(self):
        """Remove all mock data"""
        count = len(self.created_objects)
        
        # Delete in reverse order to handle foreign key constraints
        for obj in reversed(self.created_objects):
            try:
                db.session.delete(obj)
            except:
                pass  # Object might already be deleted due to cascade
        
        db.session.commit()
        self.created_objects.clear()
        return count
    
    def get_stats(self):
        """Get current mock data statistics"""
        return {
            "users": User.query.filter(User.username.in_(["alice", "bob", "charlie"])).count(),
            "flashcard_packs": FlashcardPack.query.count(),
            "flashcards": Flashcard.query.count(),
            "chat_rooms": ChatRoom.query.count(),
            "activities": UserActivity.query.count(),
            "study_sessions": StudySession.query.count()
        }

# Global instance
mock_manager = MockDataManager()
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app.extensions import db, search_vectors, embed_model
from app.engagement.models import Progress, Score
from app.learning.models import FlashcardPack, Flashcard, StudySession as LearningStudySession
from app.auth.models import User
from app.llm.model import generate_response
from .models import UserActivity
from .schemas import UserActivitySchema
import json
import logging

dashboard_bp = Blueprint('dashboard', __name__)
logger = logging.getLogger(__name__)

# Schema instances
activity_schema = UserActivitySchema()

# Activity Tracking Routes
@dashboard_bp.route('/track', methods=['POST'])
@jwt_required()
def track_activity():
    data = request.json
    user_id = get_jwt_identity()
    
    activity = UserActivity(
        user_id=user_id,
        activity_type=data.get('activity_type'),
        page_url=data.get('page_url'),
        element_id=data.get('element_id'),
        extra_data=data.get('metadata'),
        session_id=data.get('session_id')
    )
    db.session.add(activity)
    db.session.commit()
    return activity_schema.jsonify(activity), 201

@dashboard_bp.route('/sessions', methods=['POST'])
@jwt_required()
def create_study_session():
    data = request.json
    user_id = get_jwt_identity()
    
    session = LearningStudySession(
        user_id=user_id,
        subject=data.get('subject', 'Flashcards'),
        duration=data.get('duration_minutes', 0) * 60,  # convert to seconds
        completed=data.get('completed', True)
    )
    
    db.session.add(session)
    db.session.commit()
    return jsonify({'message': 'Session created', 'id': session.id}), 201

# Analytics Routes
@dashboard_bp.route('/user-dashboard', methods=['GET'])
@jwt_required()
def user_dashboard():
    user_id = get_jwt_identity()
    
    # Query user progress
    progress = Progress.query.filter_by(user_id=user_id).first()
    current_level = progress.current_level if progress else "N/A"
    completed_lessons = len(progress.completed_lessons) if progress and progress.completed_lessons else 0
    
    # Query user score
    score = Score.query.filter_by(user_id=user_id).first()
    points = score.points if score else 0
    
    # Count flashcard packs and cards
    pack_count = FlashcardPack.query.filter_by(owner_id=user_id).count()
    flashcards_count = Flashcard.query.filter_by(owner_id=user_id).count()
    
    return jsonify({
        'user_id': user_id,
        'current_level': current_level,
        'completed_lessons': completed_lessons,
        'gamification_points': points,
        'flashcard_packs_owned': pack_count,
        'flashcards_owned': flashcards_count
    })

@dashboard_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    
    # Get real user data with fresh queries
    pack_count = FlashcardPack.query.filter_by(owner_id=user_id).count()
    completed_sessions = LearningStudySession.query.filter_by(user_id=user_id, completed=True).count()
    
    # Get user's chat messages count
    from app.chat.models import ChatMessage
    message_count = ChatMessage.query.filter_by(sender_id=user_id).count()
    
    # Calculate engagement score based on activity
    total_activities = UserActivity.query.filter_by(user_id=user_id).count()
    engagement_score = min(100, (total_activities * 5) + (pack_count * 10) + (completed_sessions * 15))
    
    # Get last 7 days of activity
    today = datetime.utcnow().date()
    recent_activity = []
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        activity_count = UserActivity.query.filter(
            UserActivity.user_id == user_id,
            db.func.date(UserActivity.timestamp) == date
        ).count()
        recent_activity.append({
            'date': date.strftime('%Y-%m-%d'),
            'activity_count': activity_count
        })

    # Calculate time spent today
    start_of_today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_today = start_of_today + timedelta(days=1)
    
    study_sessions_today = LearningStudySession.query.filter(
        LearningStudySession.user_id == user_id,
        LearningStudySession.timestamp >= start_of_today,
        LearningStudySession.timestamp < end_of_today
    ).all()
    
    time_spent_today_seconds = sum(session.duration for session in study_sessions_today)
    time_spent_today_minutes = round(time_spent_today_seconds / 60)

    # Calculate streak (consecutive days with sessions)
    current_streak = 0
    study_sessions = LearningStudySession.query.filter_by(user_id=user_id).all()
    if study_sessions:
        sessions_by_date = {}
        for session in study_sessions:
            date_key = session.timestamp.date()
            if date_key not in sessions_by_date:
                sessions_by_date[date_key] = []
            sessions_by_date[date_key].append(session)
        
        current_date = datetime.utcnow().date()
        while current_date in sessions_by_date:
            current_streak += 1
            current_date = current_date - timedelta(days=1)
    
    return jsonify({
        'total_courses': pack_count,
        'completed_courses': completed_sessions,
        'total_messages': message_count,
        'engagement_score': engagement_score,
        'recent_activity': recent_activity,
        'time_spent_today': time_spent_today_minutes,
        'streak_days': current_streak
    })

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def learning_summary():
    period = request.args.get('period', 'week')
    return jsonify({
        'period': period,
        'total_study_time': 320,
        'sessions_completed': 12,
        'average_session_length': 27,
        'most_studied_topic': 'Mathematics',
        'performance_score': 85
    })

@dashboard_bp.route('/reports/export', methods=['GET'])
@jwt_required()
def export_report():
    format_type = request.args.get('format', 'json')
    return jsonify({
        'message': f'Report exported in {format_type} format',
        'download_url': '/api/insights/download/report.json'
    })

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    
    try:
        # Get flashcard stats
        total_flashcards = Flashcard.query.filter_by(owner_id=user_id).count()
        
        # Get study session stats from learning module
        study_sessions = LearningStudySession.query.filter_by(user_id=user_id).all()
        total_sessions = len(study_sessions)
        completed_sessions = len([s for s in study_sessions if s.completed])
        total_study_time = sum(s.duration for s in study_sessions)  # in seconds
        
        # Calculate streak (consecutive days with sessions)
        current_streak = 0
        if study_sessions:
            # Sort sessions by date
            sessions_by_date = {}
            for session in study_sessions:
                date_key = session.timestamp.date()
                if date_key not in sessions_by_date:
                    sessions_by_date[date_key] = []
                sessions_by_date[date_key].append(session)
            
            # Calculate streak from today backwards
            today = datetime.utcnow().date()
            current_date = today
            while current_date in sessions_by_date:
                current_streak += 1
                current_date = current_date - timedelta(days=1)
        
        # Get recent sessions for display
        recent_sessions = LearningStudySession.query.filter_by(user_id=user_id).order_by(
            LearningStudySession.timestamp.desc()
        ).limit(5).all()
        
        recent_sessions_data = []
        for session in recent_sessions:
            recent_sessions_data.append({
                'id': session.id,
                'date': session.timestamp.isoformat(),
                'duration': session.duration // 60,  # convert to minutes
                'subject': session.subject,
                'completed': session.completed
            })
        
        return jsonify({
            'total_flashcards': total_flashcards,
            'study_sessions': total_sessions,
            'current_streak': current_streak,
            'total_study_time': total_study_time,
            'recent_sessions': recent_sessions_data
        })
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({
            'total_flashcards': 0,
            'study_sessions': 0,
            'current_streak': 0,
            'total_study_time': 0,
            'recent_sessions': []
        })

@dashboard_bp.route('/debug', methods=['GET'])
@jwt_required()
def debug_data():
    user_id = get_jwt_identity()
    
    # Get all packs and their owner_ids
    all_packs = FlashcardPack.query.all()
    pack_info = [{'id': p.id, 'title': p.title, 'owner_id': p.owner_id, 'owner_type': type(p.owner_id).__name__} for p in all_packs]
    
    # Get user packs
    user_packs = FlashcardPack.query.filter_by(owner_id=user_id).all()
    user_pack_info = [{'id': p.id, 'title': p.title, 'owner_id': p.owner_id} for p in user_packs]
    
    return jsonify({
        'current_user_id': user_id,
        'user_id_type': type(user_id).__name__,
        'all_packs': pack_info,
        'user_packs': user_pack_info,
        'user_pack_count': len(user_packs)
    })

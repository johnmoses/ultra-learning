from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from datetime import datetime, timedelta
from .models import Score, Badge, UserBadge, Progress, Notification
from .schemas import ScoreSchema, BadgeSchema, UserBadgeSchema, ProgressSchema, NotificationSchema

engagement_bp = Blueprint('engagement', __name__)

# Schema instances
score_schema = ScoreSchema()
badge_schema = BadgeSchema()
user_badge_schema = UserBadgeSchema()
progress_schema = ProgressSchema()
notification_schema = NotificationSchema()
notifications_schema = NotificationSchema(many=True)

# Gamification Routes
@engagement_bp.route('/score', methods=['GET'])
@jwt_required()
def get_score():
    user_id = get_jwt_identity()
    score = Score.query.filter_by(user_id=user_id).first()
    if not score:
        score = Score(user_id=user_id, points=0)
        db.session.add(score)
        db.session.commit()
    return score_schema.jsonify(score)

@engagement_bp.route('/add-points', methods=['POST'])
@jwt_required()
def add_points():
    user_id = get_jwt_identity()
    data = request.json
    points = data.get('points', 0)
    score = Score.query.filter_by(user_id=user_id).first()
    if not score:
        score = Score(user_id=user_id, points=points)
        db.session.add(score)
    else:
        score.points += points
    db.session.commit()
    return score_schema.jsonify(score)

@engagement_bp.route('/badges', methods=['GET'])
def list_badges():
    badges = Badge.query.all()
    return jsonify([badge_schema.dump(b) for b in badges])

# Progress Routes
@engagement_bp.route('/progress', methods=['GET'])
@jwt_required()
def get_progress():
    user_id = get_jwt_identity()
    progress = Progress.query.filter_by(user_id=user_id).first()
    if not progress:
        return jsonify({'message': 'No progress found'}), 404
    return progress_schema.jsonify(progress)

@engagement_bp.route('/progress', methods=['POST'])
@jwt_required()
def update_progress():
    user_id = get_jwt_identity()
    data = request.json
    progress = Progress.query.filter_by(user_id=user_id).first()
    if not progress:
        progress = Progress(user_id=user_id)
        db.session.add(progress)
    progress.current_level = data.get('current_level', progress.current_level)
    progress.completed_lessons = data.get('completed_lessons', progress.completed_lessons)
    db.session.commit()
    return progress_schema.jsonify(progress)

# Notification Routes
@engagement_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return notifications_schema.jsonify(notifications)

@engagement_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    notif = Notification.query.get(notification_id)
    if not notif:
        return jsonify({'error': 'Notification not found'}), 404
    notif.is_read = True
    db.session.commit()
    return notification_schema.jsonify(notif)

# New engagement features
@engagement_bp.route('/streak', methods=['GET'])
@jwt_required()
def get_streak():
    user_id = get_jwt_identity()
    current_streak = 5
    longest_streak = 12
    return jsonify({
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'streak_goal': 30
    })

@engagement_bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_achievements():
    return jsonify({
        'achievements': [
            {'name': 'First Study Session', 'earned': True},
            {'name': '7-Day Streak', 'earned': False, 'progress': 5}
        ]
    })

@engagement_bp.route('/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    return jsonify({
        'leaderboard': [
            {'rank': 1, 'username': 'student1', 'points': 1250},
            {'rank': 2, 'username': 'student2', 'points': 980}
        ]
    })

@engagement_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_overview():
    user_id = get_jwt_identity()
    
    # Get user score
    score = Score.query.filter_by(user_id=user_id).first()
    total_points = score.points if score else 0
    
    # Mock data for now
    return jsonify({
        'total_points': total_points,
        'streak_days': 7,
        'time_spent_today': 45,
        'weekly_activity': [
            {'day': 'Mon', 'points': 120},
            {'day': 'Tue', 'points': 80},
            {'day': 'Wed', 'points': 150},
            {'day': 'Thu', 'points': 90},
            {'day': 'Fri', 'points': 200},
            {'day': 'Sat', 'points': 60},
            {'day': 'Sun', 'points': 110}
        ],
        'category_breakdown': [
            {'category': 'Flashcards', 'points': 300},
            {'category': 'Chat', 'points': 150},
            {'category': 'Study Time', 'points': 200},
            {'category': 'Achievements', 'points': 100}
        ],
        'achievements': [
            {
                'id': '1',
                'title': 'First Steps',
                'description': 'Completed your first study session',
                'earned_at': '2024-01-15T10:00:00Z'
            },
            {
                'id': '2', 
                'title': 'Quick Learner',
                'description': 'Answered 10 flashcards correctly in a row',
                'earned_at': '2024-01-16T14:30:00Z'
            }
        ]
    })
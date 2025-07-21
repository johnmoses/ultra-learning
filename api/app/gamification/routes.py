from flask import Blueprint, request, jsonify
from app.extensions import db
from .models import Score, Badge, UserBadge
from .schemas import ScoreSchema, BadgeSchema, UserBadgeSchema

gamification_bp = Blueprint('gamification', __name__, url_prefix='/gamification')

score_schema = ScoreSchema()
scores_schema = ScoreSchema(many=True)
badge_schema = BadgeSchema()
badges_schema = BadgeSchema(many=True)
user_badge_schema = UserBadgeSchema()
user_badges_schema = UserBadgeSchema(many=True)

@gamification_bp.route('/score/<int:user_id>', methods=['GET'])
def get_score(user_id):
    score = Score.query.filter_by(user_id=user_id).first()
    if not score:
        score = Score(user_id=user_id, points=0)
        db.session.add(score)
        db.session.commit()
    return score_schema.jsonify(score)

@gamification_bp.route('/add-points', methods=['POST'])
def add_points():
    data = request.json
    user_id = data.get('user_id')
    points = data.get('points', 0)
    score = Score.query.filter_by(user_id=user_id).first()
    if not score:
        score = Score(user_id=user_id, points=points)
        db.session.add(score)
    else:
        score.points += points
    db.session.commit()
    return score_schema.jsonify(score)

@gamification_bp.route('/badges', methods=['GET'])
def list_badges():
    badges = Badge.query.all()
    return badges_schema.jsonify(badges)

@gamification_bp.route('/user-badges/<int:user_id>', methods=['GET'])
def user_badges(user_id):
    user_badges = UserBadge.query.filter_by(user_id=user_id).all()
    return user_badges_schema.jsonify(user_badges)

@gamification_bp.route('/award-badge', methods=['POST'])
def award_badge():
    data = request.json
    user_id = data.get('user_id')
    badge_id = data.get('badge_id')
    if not user_id or not badge_id:
        return jsonify({'error': 'user_id and badge_id required'}), 400
    existing = UserBadge.query.filter_by(user_id=user_id, badge_id=badge_id).first()
    if existing:
        return jsonify({'error': 'Badge already awarded'}), 409
    user_badge = UserBadge(user_id=user_id, badge_id=badge_id)
    db.session.add(user_badge)
    db.session.commit()
    return user_badge_schema.jsonify(user_badge), 201

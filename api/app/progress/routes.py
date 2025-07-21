from flask import Blueprint, request, jsonify
from app.extensions import db
from .models import Progress
from .schemas import ProgressSchema

progress_bp = Blueprint('progress', __name__, url_prefix='/progress')

progress_schema = ProgressSchema()
progresses_schema = ProgressSchema(many=True)

@progress_bp.route('/<int:user_id>', methods=['GET'])
def get_user_progress(user_id):
    progress = Progress.query.filter_by(user_id=user_id).first()
    if not progress:
        return jsonify({'message': 'No progress found'}), 404
    return progress_schema.jsonify(progress)

@progress_bp.route('/', methods=['POST'])
def create_or_update_progress():
    data = request.json
    user_id = data.get('user_id')
    current_level = data.get('current_level')
    completed_lessons = data.get('completed_lessons', [])

    progress = Progress.query.filter_by(user_id=user_id).first()
    if not progress:
        progress = Progress(user_id=user_id, current_level=current_level, completed_lessons=completed_lessons)
        db.session.add(progress)
    else:
        progress.current_level = current_level
        progress.completed_lessons = completed_lessons
    db.session.commit()

    return progress_schema.jsonify(progress)

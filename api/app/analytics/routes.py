from flask import Blueprint, jsonify
from app.extensions import db
from app.progress.models import Progress
from app.gamification.models import Score
from app.flashcards.models import FlashcardPack, Flashcard
from app.auth.models import User

analytics_bp = Blueprint('analytics', __name__, url_prefix='/analytics')

@analytics_bp.route('/dashboard/<int:user_id>', methods=['GET'])
def user_dashboard(user_id):
    """
    Fetch analytics summary for a user:
    - Progress level
    - Completed lessons count
    - Gamification points
    - Number of owned flashcard packs and flashcards
    """

    # Query user progress
    progress = Progress.query.filter_by(user_id=user_id).first()
    current_level = progress.current_level if progress else "N/A"
    completed_lessons = len(progress.completed_lessons) if progress and progress.completed_lessons else 0

    # Query user score
    score = Score.query.filter_by(user_id=user_id).first()
    points = score.points if score else 0

    # Count flashcard packs owned
    pack_count = FlashcardPack.query.filter_by(owner_id=user_id).count()

    # Count flashcards owned (all packs flashcards + flashcards without pack)
    # Assuming flashcards have owner_id
    flashcards_count = Flashcard.query.filter_by(owner_id=user_id).count()

    # Example extra: total user count and lessons count for context
    total_users = User.query.count()
    total_packs = FlashcardPack.query.count()

    response = {
        'user_id': user_id,
        'current_level': current_level,
        'completed_lessons': completed_lessons,
        'gamification_points': points,
        'flashcard_packs_owned': pack_count,
        'flashcards_owned': flashcards_count,
        # Additional platform-wide stats:
        'total_users': total_users,
        'total_flashcard_packs': total_packs,
    }

    return jsonify(response)

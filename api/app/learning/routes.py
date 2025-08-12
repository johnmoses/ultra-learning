from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.extensions import db, init_embed_model, search_vectors, embed_model
from datetime import datetime
from flask import current_app
import os
from .models import Flashcard, FlashcardPack, StudySession
from .schemas import FlashcardSchema, FlashcardPackSchema, FlashcardPackSummarySchema
from app.chat.agents.agents import AGENTS

learning_bp = Blueprint('learning', __name__)

# Schema instances
flashcard_schema = FlashcardSchema()
flashcards_schema = FlashcardSchema(many=True)
pack_schema = FlashcardPackSchema()
packs_schema = FlashcardPackSummarySchema(many=True)

# Flashcard Pack Routes
@learning_bp.route('/packs', methods=['POST'])
@jwt_required()
def create_pack():
    data = request.json
    user_id = get_jwt_identity()
    title = data.get('title')
    if not title:
        return jsonify({'error': 'Title is required'}), 400
    pack = FlashcardPack(title=title, owner_id=user_id, description=data.get('description'))
    db.session.add(pack)
    db.session.commit()
    return pack_schema.jsonify(pack), 201

@learning_bp.route('/packs', methods=['GET'])
@jwt_required()
def get_packs():
    user_id = get_jwt_identity()
    packs = FlashcardPack.query.filter_by(owner_id=user_id).all()
    return packs_schema.jsonify(packs)

@learning_bp.route('/packs/<int:pack_id>', methods=['GET'])
@jwt_required()
def get_pack(pack_id):
    user_id = get_jwt_identity()
    pack = FlashcardPack.query.filter_by(id=pack_id, owner_id=user_id).first()
    if not pack:
        return jsonify({'error': 'Pack not found'}), 404
    return pack_schema.jsonify(pack)

# Flashcard Routes
@learning_bp.route('/flashcards', methods=['POST'])
@jwt_required()
def create_flashcard():
    data = request.json
    user_id = get_jwt_identity()
    question = data.get('question')
    answer = data.get('answer')
    pack_id = data.get('pack_id')
    if not question or not answer:
        return jsonify({'error': 'Question and answer required'}), 400
    card = Flashcard(question=question, answer=answer, owner_id=user_id, pack_id=pack_id)
    db.session.add(card)
    db.session.commit()
    return flashcard_schema.jsonify(card), 201

@learning_bp.route('/flashcards', methods=['GET'])
@jwt_required()
def list_flashcards():
    user_id = get_jwt_identity()
    pack_id = request.args.get('pack_id')
    if pack_id:
        cards = Flashcard.query.filter_by(pack_id=pack_id, owner_id=user_id).all()
    else:
        cards = Flashcard.query.filter_by(owner_id=user_id).all()
    return flashcards_schema.jsonify(cards)

@learning_bp.route('/flashcards/<int:card_id>', methods=['PUT'])
@jwt_required()
def update_flashcard(card_id):
    user_id = get_jwt_identity()
    data = request.json
    card = Flashcard.query.filter_by(id=card_id, owner_id=user_id).first()
    if not card:
        return jsonify({'error': 'Flashcard not found'}), 404
    card.question = data.get('question', card.question)
    card.answer = data.get('answer', card.answer)
    db.session.commit()
    return flashcard_schema.jsonify(card)

@learning_bp.route('/flashcards/<int:card_id>', methods=['DELETE'])
@jwt_required()
def delete_flashcard(card_id):
    user_id = get_jwt_identity()
    try:
        card = Flashcard.query.filter_by(id=card_id, owner_id=user_id).first()
        if not card:
            return jsonify({'error': 'Flashcard not found'}), 404
        db.session.delete(card)
        db.session.commit()
        return jsonify({'message': 'Flashcard deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting flashcard {card_id}: {e}")
        return jsonify({'error': f'Failed to delete flashcard: {str(e)}'}), 500

@learning_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_flashcards():
    user_id = get_jwt_identity()
    data = request.json or {}
    method = data.get('method')
    pack_id = data.get('pack_id')
    
    if not method or not pack_id:
        return jsonify({'error': 'method and pack_id are required'}), 400
    
    pack = FlashcardPack.query.filter_by(id=pack_id, owner_id=user_id).first()
    if not pack:
        return jsonify({'error': 'Pack not found'}), 404
    
    cards = []
    
    # Check if flashcard agent is available
    if 'flashcard' not in AGENTS:
        return jsonify({'error': 'Flashcard generation agent not available'}), 500
    
    flashcard_agent = AGENTS['flashcard']
    
    if method == 'textarea':
        content = data.get('content')
        if not content:
            return jsonify({'error': 'Content is required for textarea method'}), 400
        
        # Parse lines: "Question | Answer" or generate from content
        for line in content.strip().split('\n'):
            line = line.strip()
            if not line:
                continue
            if '|' in line:
                q, a = line.split('|', 1)
                cards.append(Flashcard(question=q.strip(), answer=a.strip(), owner_id=user_id, pack_id=pack_id))
            else:
                # Generate Q&A from content line
                try:
                    raw_cards = flashcard_agent.generate(f"Create a flashcard about: {line}", 1)
                    for c in raw_cards:
                        if isinstance(c, dict) and c.get('question') and c.get('answer'):
                            cards.append(Flashcard(question=c.get('question', ''), answer=c.get('answer', ''), owner_id=user_id, pack_id=pack_id))
                except Exception as e:
                    current_app.logger.error(f"Flashcard generation error for line '{line}': {e}")
                    continue
    
    elif method == 'topic':
        topic = data.get('topic')
        num_cards = data.get('num_cards', 5)
        if not topic:
            return jsonify({'error': 'Topic is required for topic method'}), 400
        
        try:
            current_app.logger.info(f"Generating flashcards for topic: {topic}, num_cards: {num_cards}")
            raw_cards = flashcard_agent.generate(topic, num_cards)
            current_app.logger.info(f"Generated {len(raw_cards)} raw cards")
            
            if not raw_cards:
                # Create simple fallback cards
                raw_cards = [
                    {"question": f"What is {topic}?", "answer": f"Please provide information about {topic}."},
                    {"question": f"Why is {topic} important?", "answer": f"Please explain the importance of {topic}."}
                ][:num_cards]
            
            for c in raw_cards:
                if isinstance(c, dict) and c.get('question') and c.get('answer'):
                    cards.append(Flashcard(question=c.get('question', ''), answer=c.get('answer', ''), owner_id=user_id, pack_id=pack_id))
                else:
                    current_app.logger.warning(f"Invalid card format: {c}")
                    
        except Exception as e:
            current_app.logger.error(f"Flashcard generation error for topic '{topic}': {e}", exc_info=True)
            # Create fallback cards even on error
            cards.append(Flashcard(
                question=f"What is {topic}?", 
                answer=f"Please provide information about {topic}. (Generated due to AI error)",
                owner_id=user_id, 
                pack_id=pack_id
            ))
    
    elif method == 'document':
        document_text = data.get('document_text')
        if not document_text:
            return jsonify({'error': 'document_text is required for document method'}), 400
        
        # Try RAG if embedding model is available, otherwise use direct generation
        try:
            # Fallback to direct generation without RAG for now
            combined_content = document_text[:2000]  # Limit content length
            
            # Generate flashcards from content
            raw_cards = flashcard_agent.generate(f"Create flashcards from this content: {combined_content}", data.get('num_cards', 5))
            
            for c in raw_cards:
                if isinstance(c, dict) and c.get('question') and c.get('answer'):
                    cards.append(Flashcard(question=c.get('question', ''), answer=c.get('answer', ''), owner_id=user_id, pack_id=pack_id))
                
        except Exception as e:
            current_app.logger.error(f"Document processing error: {e}")
            return jsonify({'error': f'Failed to process document: {str(e)}'}), 500
    
    else:
        return jsonify({'error': 'Invalid method. Use: textarea, topic, or document'}), 400
    
    if cards:
        db.session.bulk_save_objects(cards)
        db.session.commit()
    
    return jsonify({
        'method': method,
        'created_flashcards_count': len(cards),
        'pack_id': pack_id,
        'flashcards': flashcards_schema.dump(cards)
    })

# Study Session Routes
@learning_bp.route('/sessions', methods=['POST'])
@jwt_required()
def log_study_session():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    try:
        session = StudySession(
            user_id=user_id,
            duration=data.get('duration', 0),
            subject=data.get('subject', 'general'),
            completed=data.get('completed', True)
        )
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'message': 'Session logged successfully',
            'session_id': session.id
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error logging study session: {e}")
        return jsonify({'error': 'Failed to log session'}), 500

@learning_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_study_sessions():
    user_id = get_jwt_identity()
    try:
        sessions = StudySession.query.filter_by(user_id=user_id).order_by(StudySession.timestamp.desc()).limit(10).all()
        return jsonify([
            {
                'id': s.id,
                'duration': s.duration,
                'subject': s.subject,
                'completed': s.completed,
                'date': s.timestamp.isoformat()
            } for s in sessions
        ])
    except Exception as e:
        current_app.logger.error(f"Error retrieving study sessions: {e}")
        return jsonify({'error': 'Failed to retrieve sessions'}), 500

@learning_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    return jsonify({
        'recommendations': [
            {'topic': 'Review flashcards', 'priority': 'high'},
            {'topic': 'Practice quiz', 'priority': 'medium'}
        ]
    })
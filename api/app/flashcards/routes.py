from flask import Blueprint, request, jsonify
from app.extensions import db
from .models import Flashcard, FlashcardPack
from .schemas import FlashcardSchema, FlashcardPackSchema

flashcards_bp = Blueprint('flashcards', __name__, url_prefix='/flashcards')

flashcard_schema = FlashcardSchema()
flashcards_schema = FlashcardSchema(many=True)
pack_schema = FlashcardPackSchema()
packs_schema = FlashcardPackSchema(many=True)

@flashcards_bp.route('/packs', methods=['POST'])
def create_pack():
    data = request.json
    title = data.get('title')
    owner_id = data.get('owner_id')
    if not title or not owner_id:
        return jsonify({'error': 'Title and owner_id are required'}), 400
    description = data.get('description')
    pack = FlashcardPack(title=title, owner_id=owner_id, description=description)
    db.session.add(pack)
    db.session.commit()
    return pack_schema.jsonify(pack), 201

@flashcards_bp.route('/packs', methods=['GET'])
def get_packs():
    packs = FlashcardPack.query.all()
    return packs_schema.jsonify(packs)

@flashcards_bp.route('/flashcards', methods=['POST'])
def create_flashcard():
    data = request.json
    question = data.get('question')
    answer = data.get('answer')
    owner_id = data.get('owner_id')
    pack_id = data.get('pack_id') 
    if not question or not answer or not owner_id:
        return jsonify({'error': 'Question, answer, and owner_id required'}), 400
    card = Flashcard(question=question, answer=answer, owner_id=owner_id, pack_id=pack_id)
    db.session.add(card)
    db.session.commit()
    return flashcard_schema.jsonify(card), 201

@flashcards_bp.route('/flashcards', methods=['GET'])
def list_flashcards():
    pack_id = request.args.get('pack_id')
    if pack_id:
        cards = Flashcard.query.filter_by(pack_id=pack_id).all()
    else:
        cards = Flashcard.query.all()
    return flashcards_schema.jsonify(cards)

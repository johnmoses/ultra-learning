from flask import Blueprint, request, jsonify
from app.extensions import db, init_embed_model
from .models import ChatRoom, ChatMessage
from .schemas import ChatRoomSchema, ChatMessageSchema
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.extensions import search_vectors
from app.llm.model import generate_response
from app.auth.models import User

chat_bp = Blueprint('chat', __name__, url_prefix='/chat')

room_schema = ChatRoomSchema()
rooms_schema = ChatRoomSchema(many=True)
message_schema = ChatMessageSchema()
messages_schema = ChatMessageSchema(many=True)
chat_message_schema = ChatMessageSchema()
chat_messages_schema = ChatMessageSchema(many=True)

def get_or_create_bot_user():
    bot_user = User.query.filter_by(username="bot").first()
    if not bot_user:
        bot_user = User(username="bot", role="bot", email="bot@bot")
        bot_user.set_password("bot")
        db.session.add(bot_user)
        db.session.commit()
    return bot_user

@chat_bp.route('/rooms', methods=['POST'])
def create_room():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Room name required'}), 400
    if ChatRoom.query.filter_by(name=name).first():
        return jsonify({'error': 'Room already exists'}), 409
    room = ChatRoom(name=name)
    db.session.add(room)
    db.session.commit()
    return room_schema.jsonify(room), 201

@chat_bp.route('/rooms', methods=['GET'])
def list_rooms():
    rooms = ChatRoom.query.all()
    return rooms_schema.jsonify(rooms)

@chat_bp.route('/rooms/<int:room_id>/messages', methods=['GET'])
def room_messages(room_id):
    messages = ChatMessage.query.filter_by(room_id=room_id).order_by(ChatMessage.timestamp.asc()).all()
    return messages_schema.jsonify(messages)


@chat_bp.route("/rooms/<int:room_id>/post_message", methods=["POST"])
@jwt_required()
def post_message_and_get_bot_reply(room_id):
    data = request.json
    content = data.get("content")
    role = data.get("role")  # 'learner' or 'instructor'
    user_id = get_jwt_identity()

    if role not in ["learner", "instructor"]:
        return jsonify({"error": "Invalid role"}), 400
    if not content:
        return jsonify({"error": "Message content required"}), 400

    # Save user message
    user_msg = ChatMessage(room_id=room_id, sender_id=user_id, content=content, role=role, timestamp=datetime.utcnow())
    # Assumes db.session exists
    from app.extensions import db
    db.session.add(user_msg)
    db.session.commit()

    # Retrieve recent chat messages for context (last, e.g., 10 messages)
    recent_msgs = ChatMessage.query.filter_by(room_id=room_id).order_by(ChatMessage.timestamp.desc()).limit(20).all()
    recent_msgs.reverse()  # chronological order

    # Prepare messages grouped by role
    learner_msgs = "\n".join(m.content for m in recent_msgs if m.role == "learner")
    instructor_msgs = "\n".join(m.content for m in recent_msgs if m.role == "instructor")
    bot_msgs = "\n".join(m.content for m in recent_msgs if m.role == "bot")

    # Retrieve relevant documents from Milvus as context (optional RAG)
    # Embed latest user content
    embedding_vector = init_embed_model().encode(content).tolist()  # ensure embed_model available
    docs = search_vectors(embedding_vector, top_k=5)
    if not docs or not docs[0]:
        docs_text = ""
    else:
        docs_text = "\n".join(r['text'] for r in docs[0])

    # Compose prompt using your template
    current_date = datetime.utcnow().strftime("%A, %B %d, %Y, %I:%M %p UTC")
    prompt = f"""
    Current date and time: {current_date}

    Conversation:

    Learner:
    {learner_msgs}

    Instructor:
    {instructor_msgs}

    Bot (previous):
    {bot_msgs}

    Context:
    {docs_text}

    Assistant, generate the next helpful, concise reply for the user message:
    {content}
    """

    # Generate bot reply
    bot_reply_text = generate_response(prompt, max_tokens=512)

    # Save bot reply as message
    bot_user = get_or_create_bot_user()
    bot_msg = ChatMessage(
        room_id=room_id,
        sender_id=bot_user.id,  # must not be None!
        content=bot_reply_text,
        role="bot",
        timestamp=datetime.utcnow(),
    )
    db.session.add(bot_msg)
    db.session.commit()

    # return jsonify({
    #     "bot_reply": bot_reply_text,
    #     "conversation": [m.as_dict() for m in ChatMessage.query.filter_by(room_id=room_id).order_by(ChatMessage.timestamp.asc())]
    # })
    # finally serialize messages
    messages = ChatMessage.query.filter_by(room_id=room_id).order_by(ChatMessage.timestamp.asc()).all()
    conversation = chat_messages_schema.dump(messages)

    return jsonify({
        "bot_reply": bot_reply_text,
        "conversation": conversation,
    })


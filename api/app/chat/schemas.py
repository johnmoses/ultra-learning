from app.extensions import ma
from .models import ChatRoom, ChatMessage
from marshmallow import fields

class ChatRoomSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ChatRoom
        load_instance = True


class ChatMessageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ChatMessage
        # Optionally load instance to allow deserialization to ORM objects:
        load_instance = True
        include_fk = True  # to include foreign key fields like room_id, sender_id

    # Override or add fields if needed, like controlling serialization format
    timestamp = fields.DateTime(format='iso')


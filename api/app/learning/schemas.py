from app.extensions import ma
from .models import Flashcard, FlashcardPack

class FlashcardSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Flashcard
        load_instance = True

class FlashcardPackSummarySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = FlashcardPack
        load_instance = True
        exclude = ('flashcards',)

class FlashcardPackSchema(ma.SQLAlchemyAutoSchema):
    flashcards = ma.Nested(FlashcardSchema, many=True)
    class Meta:
        model = FlashcardPack
        load_instance = True

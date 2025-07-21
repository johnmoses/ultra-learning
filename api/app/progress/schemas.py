from app.extensions import ma
from .models import Progress

class ProgressSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Progress
        load_instance = True

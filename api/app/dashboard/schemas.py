from app.extensions import ma
from .models import UserActivity

class UserActivitySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = UserActivity
        load_instance = True
from app.extensions import ma
from .models import Score, Badge, UserBadge

class ScoreSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Score
        load_instance = True

class BadgeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Badge
        load_instance = True

class UserBadgeSchema(ma.SQLAlchemyAutoSchema):
    badge = ma.Nested(BadgeSchema)
    class Meta:
        model = UserBadge
        load_instance = True

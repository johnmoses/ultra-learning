from app.extensions import ma
from .models import Score, Badge, UserBadge, Progress, Notification

# Gamification Schemas
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

# Progress Schemas
class ProgressSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Progress
        load_instance = True

# Notification Schemas
class NotificationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Notification
        load_instance = True
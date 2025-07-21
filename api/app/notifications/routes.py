from flask import Blueprint, jsonify, request
from app.extensions import db
from .models import Notification
from .schemas import NotificationSchema

notification_bp = Blueprint('notifications', __name__, url_prefix='/notifications')

notification_schema = NotificationSchema()
notifications_schema = NotificationSchema(many=True)

@notification_bp.route('/user/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return notifications_schema.jsonify(notifications)

@notification_bp.route('/mark-read/<int:notification_id>', methods=['POST'])
def mark_as_read(notification_id):
    notif = Notification.query.get(notification_id)
    if not notif:
        return jsonify({'error': 'Notification not found'}), 404
    notif.is_read = True
    db.session.commit()
    return notification_schema.jsonify(notif)

@notification_bp.route('/', methods=['POST'])
def create_notification():
    data = request.json
    user_id = data.get('user_id')
    message = data.get('message')
    notify_at = data.get('notify_at')  # optional datetime string

    if not user_id or not message:
        return jsonify({'error': 'User ID and message required'}), 400

    notif = Notification(user_id=user_id, message=message, notify_at=notify_at)
    db.session.add(notif)
    db.session.commit()
    return notification_schema.jsonify(notif), 201

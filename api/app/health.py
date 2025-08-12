from flask import Blueprint, jsonify
from app.extensions import db
import os

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint"""
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    return jsonify({
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "environment": os.getenv('FLASK_ENV', 'production'),
        "service": "UltraLearning API"
    })

@health_bp.route('/version', methods=['GET'])
def version():
    """API version information"""
    return jsonify({
        "service": "UltraLearning API",
        "version": "1.0.0",
        "environment": os.getenv('FLASK_ENV', 'production')
    })
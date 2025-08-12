from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.auth.models import User
from app.mock_data import mock_manager
import os

dev_bp = Blueprint('dev', __name__)

def is_development():
    """Check if running in development mode"""
    return os.getenv('FLASK_ENV') == 'development'

@dev_bp.route('/seed-mock-data', methods=['POST'])
def seed_mock_data():
    """Seed database with mock data (development only)"""
    if not is_development():
        return jsonify({"error": "Only available in development mode"}), 403
    
    try:
        count = mock_manager.seed_all()
        stats = mock_manager.get_stats()
        return jsonify({
            "message": f"Successfully seeded {count} mock objects",
            "stats": stats
        }), 201
    except Exception as e:
        return jsonify({"error": f"Failed to seed data: {str(e)}"}), 500

@dev_bp.route('/flush-mock-data', methods=['DELETE'])
def flush_mock_data():
    """Remove all mock data (development only)"""
    if not is_development():
        return jsonify({"error": "Only available in development mode"}), 403
    
    try:
        count = mock_manager.flush_all()
        return jsonify({
            "message": f"Successfully removed {count} mock objects",
            "stats": mock_manager.get_stats()
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to flush data: {str(e)}"}), 500

@dev_bp.route('/mock-data-stats', methods=['GET'])
def mock_data_stats():
    """Get current mock data statistics"""
    if not is_development():
        return jsonify({"error": "Only available in development mode"}), 403
    
    stats = mock_manager.get_stats()
    return jsonify({
        "environment": "development",
        "mock_data_stats": stats,
        "total_objects": sum(stats.values())
    })

@dev_bp.route('/reset-database', methods=['POST'])
def reset_database():
    """Reset database and seed fresh mock data"""
    if not is_development():
        return jsonify({"error": "Only available in development mode"}), 403
    
    try:
        # Flush existing mock data
        flush_count = mock_manager.flush_all()
        
        # Seed fresh data
        seed_count = mock_manager.seed_all()
        
        return jsonify({
            "message": "Database reset successfully",
            "flushed": flush_count,
            "seeded": seed_count,
            "stats": mock_manager.get_stats()
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to reset database: {str(e)}"}), 500

@dev_bp.route('/test-users', methods=['GET'])
def get_test_users():
    """Get test user credentials for easy login"""
    if not is_development():
        return jsonify({"error": "Only available in development mode"}), 403
    
    return jsonify({
        "test_users": [
            {"username": "alice", "password": "testpass123", "role": "user"},
            {"username": "bob", "password": "testpass123", "role": "user"},
            {"username": "charlie", "password": "testpass123", "role": "admin"}
        ],
        "note": "Use these credentials for testing"
    })
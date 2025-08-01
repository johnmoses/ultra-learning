from app import create_app, db, socketio
import logging
import os


def setup_logging():
    """Configure application logging"""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    logging.getLogger('werkzeug').setLevel(logging.WARNING)


def initialize_database(app):
    """Initialize database tables"""
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database initialized successfully")
        except Exception as e:
            app.logger.error(f"Database initialization failed: {e}")
            raise


if __name__ == '__main__':
    setup_logging()
    app = create_app()
    initialize_database(app)
    
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    port = int(os.getenv('PORT', 5001))
    host = os.getenv('HOST', '0.0.0.0')
    
    app.logger.info(f"Starting UltraLearning API on {host}:{port}")
    socketio.run(app, host=host, port=port, debug=debug_mode)

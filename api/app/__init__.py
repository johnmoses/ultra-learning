from flask import Flask
from app.extensions import (
    db,
    migrate,
    jwt,
    jwt_blacklist,
    socketio,
    ma,
    init_milvus_client, init_embed_model
)
from app.auth.models import User


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(app)
    ma.init_app(app)

    # Import and register blueprints
    from app.auth.routes import auth_bp
    from app.chat.routes import chat_bp
    from app.flashcards.routes import flashcards_bp
    from app.analytics.routes import analytics_bp
    from app.gamification.routes import gamification_bp
    from app.progress.routes import progress_bp
    from app.notifications.routes import notification_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(flashcards_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(gamification_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(notification_bp)

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return jti in jwt_blacklist

    # Initialize Milvus Lite client with DB file
    with app.app_context():
        # Initialize db
        db.create_all()
        bot = User.query.filter_by(username="bot").first()
        if not bot:
            bot = User(username="bot", role="bot", email="bot@bot")
            bot.set_password("bot")
            db.session.add(bot)
            db.session.commit()
        # Initialize Milvus Lite client and collection
        try:
            init_milvus_client(
            db_path=app.config.get("MILVUS_DB_PATH", "./milvus_rag.db"),
            collection=app.config.get("MILVUS_COLLECTION", "ultra_learning_collection"),
            dim=app.config.get("MILVUS_DIMENSION", 384),
            )
        except Exception as e:
            app.logger.error("Failed to initialize Milvus client: %s", e)
        init_embed_model()
    return app

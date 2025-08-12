from flask import Flask
from flask_cors import CORS
from app.extensions import (
    db,
    migrate,
    jwt,
    jwt_blacklist,
    socketio,
    ma,
    init_milvus_client, 
    init_embed_model
)
from app.auth.models import User
# from app.learning.models import *
# from app.engagement.models import *
# from app.chat.models import *
# from app.dashboard.models import UserActivity


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

    # --- Initialize Flask extensions ---
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(app)
    ma.init_app(app)

    # Import and register blueprints
    from app.auth.routes import auth_bp
    from app.chat.routes import chat_bp
    from app.learning.routes import learning_bp
    from app.engagement.routes import engagement_bp
    from app.dashboard.routes import dashboard_bp
    from app.health import health_bp
    from app.dev_tools import dev_bp

    # Core blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(health_bp, url_prefix='/api')
    
    # Functional groups
    app.register_blueprint(learning_bp, url_prefix='/api/learning')
    app.register_blueprint(engagement_bp, url_prefix='/api/engagement')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    
    # Development tools (only in dev mode)
    app.register_blueprint(dev_bp, url_prefix='/api/dev')

    # --- JWT Token Revocation (Blacklist) ---
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return jti in jwt_blacklist
    
    
    # --- Application Context Initializations (DB, Milvus, Models) ---
    with app.app_context():
        # Initialize Database Tables (for dev/first run; use Flask-Migrate in prod)
        db.create_all()

        # Ensure 'learning_assistant' user exists for AI/RAG interactions
        learning_bot = User.query.filter_by(username="learning_assistant").first()
        if not learning_bot:
            try:
                learning_bot = User(username="learning_assistant", email="assistant@ultralearning.com", role="assistant") 
                learning_bot.set_password(app.config.get("BOT_PASSWORD", "secure_bot_password"))
                db.session.add(learning_bot)
                db.session.commit()
                app.logger.info("Created 'learning_assistant' user.")
            except Exception as e:
                app.logger.error(f"Failed to create 'learning_assistant' user: {e}", exc_info=True)
                db.session.rollback()


        # Initialize Milvus Client and Collection for financial document embeddings
        try:
            milvus_db_path = app.config.get("MILVUS_DB_PATH")
            milvus_collection = app.config.get("MILVUS_COLLECTION")
            milvus_dimension = app.config.get("MILVUS_DIMENSION")
            
            if not all([milvus_db_path, milvus_collection, milvus_dimension]):
                app.logger.error("Missing Milvus configuration. Check MILVUS_DB_PATH, MILVUS_COLLECTION, MILVUS_DIMENSION in config.py")
                # Decide if you want to raise an error and prevent startup, or continue with warning
                raise RuntimeError("Milvus configuration missing.")
                
            init_milvus_client(
                db_path=milvus_db_path,
                collection=milvus_collection,
                dim=milvus_dimension,
            )
            app.logger.info("Milvus client initialized successfully.")
        except Exception as e:
            app.logger.error(f"Failed to initialize Milvus client: {e}", exc_info=True)
            # Depending on criticality, you might want to re-raise or sys.exit(1)

        # Initialize Embedding Model
        try:
            embed_model_name = app.config.get("EMBED_MODEL_NAME")
            if not embed_model_name:
                app.logger.error("Missing Embedding Model configuration (EMBED_MODEL_NAME).")
                raise RuntimeError("Embedding Model configuration missing.")
            init_embed_model(model_name=embed_model_name)
            app.logger.info("Embedding model initialized successfully.")
        except Exception as e:
            app.logger.error(f"Failed to initialize embedding model: {e}", exc_info=True)

        # Llama Model - using lazy loading to prevent segfault
        app.logger.info("Llama model will be loaded on first use (lazy loading).")
        
    return app
# UltraLearning API - Reorganized Structure

## Blueprint Organization

Each blueprint now contains all related files in one place:

### 🔐 `/app/auth/`
- `models.py` - User model
- `routes.py` - Authentication endpoints
- `schemas.py` - User schemas

### 🤖 `/app/chat/`
- `models.py` - Chat room, message models
- `routes.py` - Chat endpoints
- `schemas.py` - Chat schemas
- `socket.py` - WebSocket handlers
- `agents/` - AI agent implementations

### 📚 `/app/learning/`
- `models.py` - Flashcard models (moved from flashcards/)
- `schemas.py` - Flashcard schemas (moved from flashcards/)
- `routes.py` - Main learning routes
- `flashcard_routes.py` - Flashcard-specific routes

### 🎮 `/app/engagement/`
- `routes.py` - Main engagement routes
- `gamification_models.py` - Points, badges, achievements
- `gamification_routes.py` - Gamification endpoints
- `gamification_schemas.py` - Gamification schemas
- `progress_models.py` - Learning progress tracking
- `progress_routes.py` - Progress endpoints
- `progress_schemas.py` - Progress schemas
- `notification_models.py` - Notification system
- `notification_routes.py` - Notification endpoints
- `notification_schemas.py` - Notification schemas

### 📊 `/app/insights/`
- `routes.py` - Main insights routes
- `analytics_routes.py` - Analytics endpoints (moved from analytics/)
- `rag_routes.py` - RAG endpoints (moved from rag/)

### 🧠 `/app/llm/`
- `model.py` - LLM integration utilities

### 🏥 Core Files
- `health.py` - Health check endpoints
- `extensions.py` - Flask extensions
- `__init__.py` - App factory

## Benefits

✅ **Complete blueprints** - All related files in one place
✅ **Clean structure** - No scattered files across folders
✅ **Easy maintenance** - Find everything for a feature in one location
✅ **Better imports** - Clear module organization
✅ **Removed unused** - Cleaned up empty folders and cache files
# UltraLearning API - Merged Blueprint Structure

## Clean Blueprint Organization

Each blueprint now contains exactly 3 files (models, schemas, routes):

### 🔐 `/app/auth/` - Authentication
- `models.py` - User model
- `routes.py` - Auth endpoints (login, register, profile)
- `schemas.py` - User validation schemas

### 🤖 `/app/chat/` - AI Chat & Agents
- `models.py` - ChatRoom, ChatMessage models
- `routes.py` - Chat endpoints, WebSocket integration
- `schemas.py` - Chat validation schemas
- `socket.py` - WebSocket handlers
- `agents/` - AI agent implementations

### 📚 `/app/learning/` - Learning Activities
- `models.py` - Flashcard, FlashcardPack models
- `routes.py` - Flashcards, study sessions, recommendations
- `schemas.py` - Learning validation schemas

### 🎮 `/app/engagement/` - User Engagement
- `models.py` - Score, Badge, Progress, Notification models
- `routes.py` - Gamification, progress tracking, notifications
- `schemas.py` - Engagement validation schemas

### 📊 `/app/insights/` - Analytics & Intelligence
- `routes.py` - Analytics, RAG, reporting endpoints

### 🧠 `/app/llm/` - AI Core
- `model.py` - LLM integration utilities

### 🏥 Core Files
- `health.py` - Health check endpoints
- `extensions.py` - Flask extensions
- `__init__.py` - App factory

## Key Benefits

✅ **Single file per concern** - models.py, schemas.py, routes.py per blueprint
✅ **No scattered files** - Everything for a feature in one place
✅ **Clean imports** - Simple, predictable module structure
✅ **Easy maintenance** - Find any functionality quickly
✅ **Consistent pattern** - Same structure across all blueprints

## API Endpoints

```
# Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile

# Learning
GET  /api/learning/packs
POST /api/learning/flashcards
POST /api/learning/sessions

# Engagement  
GET  /api/engagement/score
GET  /api/engagement/streak
GET  /api/engagement/notifications

# Insights
GET  /api/insights/dashboard
GET  /api/insights/summary
POST /api/insights/generate-flashcards

# Chat
POST /api/chat/rooms
GET  /api/chat/rooms/{id}/messages

# System
GET  /api/health
GET  /api/version
```
# UltraLearning API - Dashboard Structure

## Renamed Blueprint: insights → dashboard

### 📊 `/app/dashboard/` - Analytics & User Tracking
- `models.py` - UserActivity, StudySession models
- `routes.py` - Analytics, activity tracking, RAG endpoints
- `schemas.py` - Dashboard validation schemas

## New Models

### UserActivity
Tracks user interactions:
- `activity_type` - page_view, button_click, session_start, etc.
- `page_url` - Current page URL
- `element_id` - Button/element identifier
- `metadata` - Additional JSON data
- `session_id` - User session tracking

### StudySession
Tracks learning sessions:
- `start_time`, `end_time` - Session duration
- `duration_minutes` - Total study time
- `subject` - Study topic
- `flashcards_reviewed` - Cards studied
- `correct_answers` - Performance metric

## API Endpoints

```
# Activity Tracking
POST /api/dashboard/track           # Track user activity
POST /api/dashboard/sessions        # Log study session

# Analytics
GET  /api/dashboard/user-dashboard  # User analytics summary
GET  /api/dashboard/overview        # Real-time dashboard data
GET  /api/dashboard/summary         # Learning summary by period
GET  /api/dashboard/reports/export  # Export user data

# AI Features
POST /api/dashboard/generate-flashcards  # RAG-powered flashcard generation
```

## Usage Examples

### Track Page View
```json
POST /api/dashboard/track
{
  "activity_type": "page_view",
  "page_url": "/flashcards",
  "session_id": "abc123"
}
```

### Track Button Click
```json
POST /api/dashboard/track
{
  "activity_type": "button_click",
  "element_id": "create-flashcard-btn",
  "page_url": "/flashcards",
  "metadata": {"pack_id": 5}
}
```

### Log Study Session
```json
POST /api/dashboard/sessions
{
  "subject": "Mathematics",
  "duration_minutes": 45,
  "flashcards_reviewed": 20,
  "correct_answers": 16,
  "completed": true
}
```
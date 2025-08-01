# UltraLearning API - Postman Testing Guide

## 📥 Import Collection

1. Open Postman
2. Click **Import** button
3. Select `postman_collection.json` file
4. Collection will be imported with all endpoints organized by feature

## 🔧 Setup Variables

The collection uses these variables (auto-populated during testing):
- `base_url`: http://localhost:5001/api
- `access_token`: JWT token (set after login)
- `user_id`: User ID (set after registration/login)
- `pack_id`: Flashcard pack ID (set after creating pack)
- `room_id`: Chat room ID (set after creating room)

## 🚀 Testing Workflow

### 1. System Health
- ✅ Health Check
- ✅ Version Info

### 2. Authentication Flow
1. **Register User** → Sets `user_id`
2. **Login User** → Sets `access_token` & `user_id`
3. **Get Profile** → Verify authentication
4. **Logout** → Clear session

### 3. Learning Features
1. **Create Flashcard Pack** → Sets `pack_id`
2. **Get Flashcard Packs** → List user's packs
3. **Create Flashcard** → Add manual flashcard
4. **Get Flashcards** → View pack contents
5. **Generate Flashcards (LLM)** → AI-generated cards
6. **Log Study Session** → Track learning time
7. **Get Recommendations** → Personalized suggestions

### 4. Engagement System
1. **Get User Score** → Current points
2. **Add Points** → Reward user activity
3. **Get Badges** → Available achievements
4. **Get/Update Progress** → Learning milestones
5. **Get Notifications** → User alerts
6. **Get Streak** → Daily activity tracking
7. **Get Achievements** → Earned badges
8. **Get Leaderboard** → Social competition

### 5. Chat & AI
1. **Create Chat Room** → Sets `room_id`
2. **List Chat Rooms** → Available rooms
3. **Send Message** → Basic messaging
4. **Get Room Messages** → Message history
5. **Post Message with AI Reply** → AI-powered responses

### 6. Dashboard Analytics
1. **Track Activity** → Log page views
2. **Track Button Click** → Log interactions
3. **Create Study Session** → Detailed session data
4. **Get User Dashboard** → User analytics
5. **Get Dashboard Overview** → Real-time metrics
6. **Get Learning Summary** → Period-based reports
7. **Generate Flashcards (RAG)** → AI with context

## 🔐 Authentication Notes

- Most endpoints require authentication
- Login first to get `access_token`
- Token is automatically used in subsequent requests
- Collection uses Bearer token authentication

## 📊 Test Data Examples

### User Registration
```json
{
    "username": "testuser",
    "email": "test@ultralearning.com", 
    "password": "testpass123",
    "role": "user"
}
```

### Flashcard Creation
```json
{
    "question": "What is a Python list?",
    "answer": "An ordered collection of items",
    "pack_id": 1
}
```

### Activity Tracking
```json
{
    "activity_type": "button_click",
    "element_id": "create-flashcard-btn",
    "page_url": "/flashcards",
    "metadata": {"pack_id": 1}
}
```

## 🎯 Expected Response Codes

- **200**: Success (GET requests)
- **201**: Created (POST requests)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

## 🔄 Auto-Variable Setting

The collection automatically sets variables from responses:
- Registration → `user_id`
- Login → `access_token`, `user_id`
- Create Pack → `pack_id`
- Create Room → `room_id`

## 🧪 Testing Tips

1. **Run in sequence** for best results
2. **Start with Health Check** to verify server
3. **Always login first** before testing protected endpoints
4. **Check response variables** are being set correctly
5. **Use different test data** to avoid conflicts

## 📝 Collection Structure

```
🏥 System Health (2 requests)
🔐 Authentication (4 requests)
📚 Learning (7 requests)
🎮 Engagement (9 requests)
🤖 Chat (5 requests)
📊 Dashboard (7 requests)
```

**Total: 34 comprehensive test requests covering all API functionality**
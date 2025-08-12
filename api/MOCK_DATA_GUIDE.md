# UltraLearning API - Mock Data Management

## 🎯 Smart Mock Data System

Easily populate your database with realistic test data and clean it up when done.

## 🚀 Quick Start

### Via API Endpoints (Development Mode Only)

```bash
# Seed mock data
POST /api/dev/seed-mock-data

# Remove mock data  
DELETE /api/dev/flush-mock-data

# Get statistics
GET /api/dev/mock-data-stats

# Reset database (flush + seed)
POST /api/dev/reset-database

# Get test user credentials
GET /api/dev/test-users
```

### Via Command Line

```bash
# Seed mock data
python seed_data.py seed

# Remove mock data
python seed_data.py flush

# Reset (flush + seed)
python seed_data.py reset

# Show statistics
python seed_data.py stats
```

## 📊 Mock Data Includes

### 👥 Users (3)
- **alice** (user) - testpass123
- **bob** (user) - testpass123  
- **charlie** (admin) - testpass123

### 📚 Learning Data
- **3 Flashcard Packs** (Python, Data Structures, Web Dev)
- **6 Flashcards** (2 per pack)
- Realistic questions and answers

### 🎮 Engagement Data
- **User Scores** (100-1000 points)
- **2 Badges** (First Steps, Study Streak)
- **Progress Records** (levels, completed lessons)
- **Welcome Notifications**

### 💬 Chat Data
- **1 Study Group** chat room
- **User Participants** (alice, bob)
- **Sample Messages** between users

### 📈 Dashboard Data
- **User Activities** (page views, button clicks)
- **Study Sessions** (with duration, performance)
- **Session Tracking** data

## 🔧 Usage Examples

### 1. Development Workflow
```bash
# Start fresh
python seed_data.py reset

# Develop and test...

# Clean up when done
python seed_data.py flush
```

### 2. API Testing
```bash
# Seed data
curl -X POST http://localhost:5001/api/dev/seed-mock-data

# Test your endpoints with realistic data...

# Clean up
curl -X DELETE http://localhost:5001/api/dev/flush-mock-data
```

### 3. Postman Testing
1. **POST** `/api/dev/seed-mock-data` - Populate database
2. **GET** `/api/dev/test-users` - Get login credentials
3. Run your Postman collection tests
4. **DELETE** `/api/dev/flush-mock-data` - Clean up

## 🛡️ Safety Features

### Development Mode Only
- All dev endpoints check `FLASK_ENV=development`
- Production environments are protected
- Returns 403 error in non-dev modes

### Smart Object Tracking
- Tracks all created objects for clean removal
- Handles foreign key constraints properly
- Prevents orphaned data

### Realistic Data
- Proper relationships between models
- Realistic timestamps and IDs
- Valid data formats and constraints

## 📋 API Response Examples

### Seed Response
```json
{
    "message": "Successfully seeded 25 mock objects",
    "stats": {
        "users": 3,
        "flashcard_packs": 3,
        "flashcards": 6,
        "chat_rooms": 1,
        "activities": 3,
        "study_sessions": 2
    }
}
```

### Stats Response
```json
{
    "environment": "development",
    "mock_data_stats": {
        "users": 3,
        "flashcard_packs": 3,
        "flashcards": 6,
        "chat_rooms": 1,
        "activities": 3,
        "study_sessions": 2
    },
    "total_objects": 18
}
```

### Test Users Response
```json
{
    "test_users": [
        {"username": "alice", "password": "testpass123", "role": "user"},
        {"username": "bob", "password": "testpass123", "role": "user"},
        {"username": "charlie", "password": "testpass123", "role": "admin"}
    ],
    "note": "Use these credentials for testing"
}
```

## 🎯 Benefits

✅ **Instant realistic data** for testing
✅ **Clean removal** without database corruption  
✅ **Multiple interfaces** (API + CLI)
✅ **Development-only** safety
✅ **Relationship integrity** maintained
✅ **Statistics tracking** for monitoring
✅ **Easy integration** with testing workflows

## 🔄 Integration with Testing

### Before Testing
```bash
python seed_data.py seed
```

### After Testing  
```bash
python seed_data.py flush
```

### Continuous Testing
```bash
python seed_data.py reset  # Fresh data each time
```

Perfect for development, testing, and demos! 🚀
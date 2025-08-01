# UltraLearning API Structure

## Functional Groups

### 🔐 Authentication (`/api/auth`)
- User registration, login, profile management
- JWT token handling

### 🤖 Chat (`/api/chat`)
- AI-powered learning conversations
- Multi-agent integration support
- Real-time messaging with WebSocket

### 📚 Learning (`/api/learning`) 
- **Flashcards**: Create, review, manage flashcards
- **Sessions**: Study time tracking
- **Recommendations**: Personalized content suggestions

### 🎮 Engagement (`/api/engagement`)
- **Gamification**: Points, badges, achievements
- **Progress**: Learning milestones and tracking
- **Notifications**: Study reminders and updates
- **Streaks**: Daily activity tracking
- **Leaderboard**: Social competition

### 📊 Insights (`/api/insights`)
- **Analytics**: Learning performance metrics
- **Dashboard**: Overview of learning activity
- **Reports**: Detailed progress summaries
- **Export**: Data export functionality

### 🏥 System (`/api`)
- **Health**: Service status monitoring
- **Version**: API version information

## Key Endpoints

```
POST /api/learning/sessions          # Log study session
GET  /api/learning/recommendations   # Get personalized suggestions
GET  /api/engagement/streak          # Current learning streak
GET  /api/insights/dashboard         # Learning overview
GET  /api/health                     # System health check
```
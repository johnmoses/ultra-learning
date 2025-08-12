# UltraLearning Mobile App

React Native TypeScript app for the UltraLearning educational platform.

## Features

- **Authentication**: Login/Register with JWT tokens
- **Dashboard**: Overview of learning progress and stats
- **Chat**: AI-powered learning assistant with real-time messaging
- **Learning**: Browse and search learning packs by category and difficulty
- **Engagement**: Track progress, streaks, and achievements

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install iOS dependencies (iOS only):
```bash
cd ios && pod install && cd ..
```

3. Start Metro bundler:
```bash
npm start
```

4. Run on device:
```bash
# iOS
npm run ios

# Android
npm run android
```

## API Configuration

Update the API base URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-api-url:5000';
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── navigation/     # Navigation configuration
├── screens/        # Screen components
├── services/       # API services
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Dependencies

- React Native 0.80.0
- React Navigation 6
- React Native Paper (Material Design)
- Axios for API calls
- AsyncStorage for local storage
- Vector Icons for UI icons
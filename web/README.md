# UltraLearning Frontend

A Next.js 15.4.2 frontend for the UltraLearning educational platform.

## Features

- **Authentication**: Login/Register with JWT tokens
- **Dashboard**: Overview with stats and activity charts
- **Learning**: Course management with progress tracking
- **Chat**: Real-time AI chat assistant
- **Engagement**: Analytics, achievements, and gamification

## Tech Stack

- Next.js 15.4.2
- TypeScript
- Tailwind CSS
- Heroicons
- Recharts (for analytics)
- Socket.IO (for real-time chat)
- Axios (for API calls)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── auth/
│   ├── login/page.tsx
│   └── register/page.tsx
├── dashboard/page.tsx
├── chat/page.tsx
├── learning/page.tsx
├── engagement/page.tsx
├── layout.tsx
└── page.tsx
components/
└── Layout.tsx
xlib/
├── auth-context.tsx
└── api.ts
```

## API Integration

The frontend connects to the Flask API backend running on `http://localhost:5000`. Key endpoints:

- `/auth/login` - User authentication
- `/auth/register` - User registration
- `/dashboard/overview` - Dashboard data
- `/chat/messages` - Chat messages
- `/learning/courses` - Course data
- `/engagement/overview` - Engagement analytics
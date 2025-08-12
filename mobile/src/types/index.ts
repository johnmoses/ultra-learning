// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface ChatRoom {
  id: number;
  name: string;
  description: string;
  is_private: boolean;
  created_by: number;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  content: string;
  role: string;
  is_ai: boolean;
  message_type: string;
  status: string;
  timestamp: string;
}

export interface LearningPack {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  created_by: number;
  created_at: string;
}

export interface EngagementMetric {
  id: number;
  user_id: number;
  metric_type: string;
  value: number;
  timestamp: string;
}

export interface DashboardStats {
  total_users: number;
  total_learning_packs: number;
  total_chat_messages: number;
  active_sessions: number;
}
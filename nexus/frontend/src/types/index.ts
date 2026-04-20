export interface User {
  id: string;
  email: string;
  username?: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'creator' | 'brand' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  deletedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface AnomalyScore {
  score: number;
  factors: string[];
  isAnomaly: boolean;
}

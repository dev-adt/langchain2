// ============ User Types ============
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============ Chat Types ============
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  chatbotId?: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  chatbot?: {
    id: string;
    name: string;
    avatar?: string | null;
    systemPrompt?: string;
    model?: string;
  } | null;
}

export interface ConversationListItem extends Omit<Conversation, 'messages'> {
  messages?: { content: string; role: string }[];
}

// ============ Chatbot Types ============
export interface Chatbot {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  systemPrompt: string;
  starterPrompts?: string; // JSON string
  model: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  datasets?: Dataset[];
  _count?: {
    conversations: number;
  };
}

export interface Dataset {
  id: string;
  chatbotId: string;
  fileName: string;
  filePath?: string;
  fileSize: number;
  vectorStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface CreateChatbotPayload {
  name: string;
  description?: string;
  systemPrompt: string;
  starterPrompts?: { title: string; description: string; prompt: string }[];
  model: string;
}

// ============ SSE Types ============
export interface SSEEvent {
  type: 'conversation_id' | 'token' | 'done' | 'error';
  id?: string;
  content?: string;
  message?: string;
}

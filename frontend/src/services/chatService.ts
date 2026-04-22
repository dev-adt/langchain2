import api, { API_BASE_URL } from './api';
import { Conversation, ConversationListItem, SSEEvent } from '@/types';

export const chatService = {
  getConversations: async (): Promise<ConversationListItem[]> => {
    const { data } = await api.get('/chat/conversations');
    return data.conversations;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const { data } = await api.get(`/chat/conversations/${id}`);
    return data.conversation;
  },

  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/chat/conversations/${id}`);
  },

  updateConversation: async (id: string, title: string): Promise<Conversation> => {
    const { data } = await api.put(`/chat/conversations/${id}`, { title });
    return data.conversation;
  },

  // SSE streaming chat
  sendMessage: (
    message: string,
    conversationId?: string,
    chatbotId?: string,
    callbacks?: {
      onConversationId?: (id: string) => void;
      onToken?: (token: string) => void;
      onDone?: () => void;
      onError?: (error: string) => void;
    }
  ): AbortController => {
    const controller = new AbortController();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    fetch(`${API_BASE_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, conversationId, chatbotId }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          callbacks?.onError?.(errorData.error || 'Failed to send message');
          return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          callbacks?.onError?.('No response stream');
          return;
        }

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event: SSEEvent = JSON.parse(line.slice(6));
                switch (event.type) {
                  case 'conversation_id':
                    callbacks?.onConversationId?.(event.id!);
                    break;
                  case 'token':
                    callbacks?.onToken?.(event.content!);
                    break;
                  case 'done':
                    callbacks?.onDone?.();
                    break;
                  case 'error':
                    callbacks?.onError?.(event.message || 'Unknown error');
                    break;
                }
              } catch {
                // Skip malformed events
              }
            }
          }
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          callbacks?.onError?.(error.message);
        }
      });

    return controller;
  },
};

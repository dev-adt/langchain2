import { create } from 'zustand';
import { ConversationListItem, Message } from '@/types';
import { chatService } from '@/services/chatService';

interface ChatState {
  conversations: ConversationListItem[];
  activeConversationId: string | null;
  activeChatbotId: string | null;
  activeChatbotName: string | null;
  activeChatbotPrompts: { title: string; description: string; prompt: string }[] | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  streamingContent: string;
  abortController: AbortController | null;

  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  setActiveChatbot: (
    id: string | null,
    name: string | null,
    prompts?: { title: string; description: string; prompt: string }[] | null
  ) => void;
  sendMessage: (
    message: string,
    conversationId?: string,
    chatbotId?: string
  ) => void;
  stopStreaming: () => void;
  deleteConversation: (id: string) => Promise<void>;
  clearChat: () => void;
  addOptimisticMessage: (role: 'user' | 'assistant', content: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  activeChatbotId: null,
  activeChatbotName: null,
  activeChatbotPrompts: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isStreaming: false,
  streamingContent: '',
  abortController: null,

  loadConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const conversations = await chatService.getConversations();
      set({ conversations, isLoadingConversations: false });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      set({ isLoadingConversations: false });
    }
  },

  loadMessages: async (conversationId: string) => {
    set({ isLoadingMessages: true, activeConversationId: conversationId });
    try {
      const conversation = await chatService.getConversation(conversationId);
      set({
        messages: conversation.messages || [],
        isLoadingMessages: false,
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ isLoadingMessages: false });
    }
  },

  setActiveConversation: (id: string | null) => {
    set({ activeConversationId: id });
    if (!id) {
      set({ messages: [] });
    }
  },

  setActiveChatbot: (
    id: string | null,
    name: string | null,
    prompts?: { title: string; description: string; prompt: string }[] | null
  ) => {
    set({
      activeChatbotId: id,
      activeChatbotName: name,
      activeChatbotPrompts: prompts || null,
    });
  },

  sendMessage: (message: string, conversationId?: string, chatbotId?: string) => {
    // Use active chatbot if none specified
    const effectiveChatbotId = chatbotId || get().activeChatbotId || undefined;
    // Add user message optimistically
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId || '',
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      streamingContent: '',
    }));

    const controller = chatService.sendMessage(
      message,
      conversationId || get().activeConversationId || undefined,
      effectiveChatbotId,
      {
        onConversationId: (id: string) => {
          set({ activeConversationId: id });
          // Update URL without full navigation
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', `/c/${id}`);
          }
          // Reload conversations list
          get().loadConversations();
        },
        onToken: (token: string) => {
          set((state) => ({
            streamingContent: state.streamingContent + token,
          }));
        },
        onDone: () => {
          const finalContent = get().streamingContent;
          const assistantMessage: Message = {
            id: `temp-${Date.now()}-assistant`,
            conversationId: get().activeConversationId || '',
            role: 'assistant',
            content: finalContent,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isStreaming: false,
            streamingContent: '',
            abortController: null,
          }));

          // Refresh conversation list
          get().loadConversations();
        },
        onError: (error: string) => {
          console.error('Chat error:', error);
          const errorMessage: Message = {
            id: `temp-${Date.now()}-error`,
            conversationId: get().activeConversationId || '',
            role: 'assistant',
            content: `⚠️ Error: ${error}`,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, errorMessage],
            isStreaming: false,
            streamingContent: '',
            abortController: null,
          }));
        },
      }
    );

    set({ abortController: controller });
  },

  stopStreaming: () => {
    const controller = get().abortController;
    if (controller) {
      controller.abort();
    }
    const finalContent = get().streamingContent;
    if (finalContent) {
      const assistantMessage: Message = {
        id: `temp-${Date.now()}-stopped`,
        conversationId: get().activeConversationId || '',
        role: 'assistant',
        content: finalContent,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isStreaming: false,
        streamingContent: '',
        abortController: null,
      }));
    } else {
      set({ isStreaming: false, streamingContent: '', abortController: null });
    }
  },

  deleteConversation: async (id: string) => {
    try {
      await chatService.deleteConversation(id);
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        ...(state.activeConversationId === id
          ? { activeConversationId: null, messages: [] }
          : {}),
      }));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  },

  clearChat: () => {
    set({
      activeConversationId: null,
      activeChatbotId: null,
      activeChatbotName: null,
      activeChatbotPrompts: null,
      messages: [],
      isStreaming: false,
      streamingContent: '',
    });
  },

  addOptimisticMessage: (role: 'user' | 'assistant', content: string) => {
    const msg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: get().activeConversationId || '',
      role,
      content,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, msg] }));
  },
}));

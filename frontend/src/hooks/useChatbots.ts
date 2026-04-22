'use client';

import { useState, useEffect, useCallback } from 'react';
import { chatbotService } from '@/services/chatbotService';
import { Chatbot, CreateChatbotPayload } from '@/types';

export function useChatbots() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChatbots = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await chatbotService.getChatbots();
      setChatbots(data);
    } catch (error) {
      console.error('Failed to load chatbots:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatbots();
  }, [fetchChatbots]);

  const createChatbot = async (payload: CreateChatbotPayload) => {
    const chatbot = await chatbotService.createChatbot(payload);
    setChatbots((prev) => [chatbot, ...prev]);
    return chatbot;
  };

  const deleteChatbot = async (id: string) => {
    await chatbotService.deleteChatbot(id);
    setChatbots((prev) => prev.filter((b) => b.id !== id));
  };

  return { chatbots, isLoading, fetchChatbots, createChatbot, deleteChatbot };
}

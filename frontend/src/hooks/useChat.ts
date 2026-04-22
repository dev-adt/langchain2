'use client';

import { useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';

export function useChat() {
  const store = useChatStore();

  const sendAndNavigate = useCallback(
    (message: string, chatbotId?: string) => {
      store.sendMessage(message, undefined, chatbotId);
    },
    [store]
  );

  return {
    ...store,
    sendAndNavigate,
  };
}

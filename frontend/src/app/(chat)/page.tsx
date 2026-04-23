'use client';

import React from 'react';
import StarterPrompts from '@/components/chat/StarterPrompts';
import ChatInput from '@/components/chat/ChatInput';
import ChatWindow from '@/components/chat/ChatWindow';
import { useChatStore } from '@/store/chatStore';

export default function HomePage() {
  const { messages, isStreaming, activeChatbotId } = useChatStore();
  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="flex flex-col h-full">
      {hasMessages ? (
        <>
          <ChatWindow />
          <ChatInput />
        </>
      ) : (
        <>
          <StarterPrompts />
          <ChatInput />
        </>
      )}
    </div>
  );
}

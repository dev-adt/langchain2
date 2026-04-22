'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import { useChatStore } from '@/store/chatStore';

export default function ConversationPage() {
  const params = useParams();
  const id = params.id as string;
  const { loadMessages, activeConversationId, setActiveConversation } = useChatStore();

  useEffect(() => {
    if (id && id !== activeConversationId) {
      setActiveConversation(id);
      loadMessages(id);
    }
  }, [id, activeConversationId, setActiveConversation, loadMessages]);

  return (
    <div className="flex flex-col h-full">
      <ChatWindow />
      <ChatInput conversationId={id} />
    </div>
  );
}

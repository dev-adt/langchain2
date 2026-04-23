'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StarterPrompts from '@/components/chat/StarterPrompts';
import ChatInput from '@/components/chat/ChatInput';
import ChatWindow from '@/components/chat/ChatWindow';
import { useChatStore } from '@/store/chatStore';
import { chatbotService } from '@/services/chatbotService';

function HomeContent() {
  const { messages, isStreaming, activeChatbotId, setActiveChatbot, clearChat } = useChatStore();
  const searchParams = useSearchParams();
  const botId = searchParams.get('bot');
  const hasMessages = messages.length > 0 || isStreaming;

  useEffect(() => {
    const initBotFromUrl = async () => {
      if (botId && botId !== activeChatbotId) {
        try {
          const chatbot = await chatbotService.getChatbot(botId);
          let prompts = null;
          if (chatbot.starterPrompts) {
            try {
              prompts = JSON.parse(chatbot.starterPrompts);
            } catch (e) {
              console.error('Failed to parse starter prompts', e);
            }
          }
          setActiveChatbot(chatbot.id, chatbot.name, prompts);
        } catch (error) {
          console.error('Failed to load bot from URL:', error);
          // If failed, revert to default
          setActiveChatbot(null, null);
        }
      } else if (!botId && activeChatbotId) {
        // If no bot in URL but we have one active, clear it (go back to default)
        setActiveChatbot(null, null);
      }
    };

    initBotFromUrl();
  }, [botId, activeChatbotId, setActiveChatbot]);

  return (
    <div className="flex flex-col h-full">
      {hasMessages ? (
        <>
          <ChatWindow />
          <ChatInput chatbotId={botId || undefined} />
        </>
      ) : (
        <>
          <StarterPrompts />
          <ChatInput chatbotId={botId || undefined} />
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { chatbotService } from '@/services/chatbotService';
import StarterPrompts from '@/components/chat/StarterPrompts';
import ChatInput from '@/components/chat/ChatInput';
import ChatWindow from '@/components/chat/ChatWindow';
import { Loader2 } from 'lucide-react';

export default function SharedChatbotPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { 
    setActiveChatbot, 
    activeChatbotId, 
    clearChat,
    messages,
    isStreaming
  } = useChatStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSharedBot = async () => {
      try {
        setIsLoading(true);
        // Clear previous chat state to start fresh with the shared bot
        if (activeChatbotId !== id) {
          clearChat();
        }

        const chatbot = await chatbotService.getChatbot(id);
        
        // Parse starter prompts if they exist
        let prompts = null;
        if (chatbot.starterPrompts) {
          try {
            prompts = JSON.parse(chatbot.starterPrompts);
          } catch (e) {
            console.error('Failed to parse starter prompts', e);
          }
        }

        setActiveChatbot(chatbot.id, chatbot.name, prompts);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to load shared chatbot:', err);
        setError(err.response?.data?.error || 'Không thể tải chatbot này. Có thể nó không tồn tại hoặc không được chia sẻ.');
        setIsLoading(false);
      }
    };

    if (id) {
      initSharedBot();
    }
  }, [id, setActiveChatbot, clearChat, activeChatbotId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-600" />
        <p className="text-sm font-medium">Đang tải cấu hình chatbot...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Có lỗi xảy ra</h2>
        <p className="text-gray-500 mb-8 max-w-md">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-100"
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="flex flex-col h-full">
      {hasMessages ? (
        <>
          <ChatWindow />
          <ChatInput chatbotId={id} />
        </>
      ) : (
        <>
          <StarterPrompts />
          <ChatInput chatbotId={id} />
        </>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { chatbotService } from '@/services/chatbotService';
import StarterPrompts from '@/components/chat/StarterPrompts';
import ChatInput from '@/components/chat/ChatInput';
import ChatWindow from '@/components/chat/ChatWindow';
import { Loader2 } from 'lucide-react';

export default function EmbedChatPage() {
  const params = useParams();
  const id = params.id as string;
  const { 
    setActiveChatbot, 
    clearChat,
    messages,
    isStreaming
  } = useChatStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initEmbedBot = async () => {
      try {
        setIsLoading(true);
        // Always clear chat when loading embed to ensure clean state
        clearChat();

        const chatbot = await chatbotService.getPublicChatbot(id);
        
        // Parse starter prompts if they exist
        let prompts = null;
        if (chatbot.starterPrompts) {
          try {
            prompts = JSON.parse(chatbot.starterPrompts);
          } catch (e) {
            console.error('Failed to parse starter prompts', e);
          }
        }

        setActiveChatbot(chatbot.id, chatbot.name, prompts, chatbot.avatar);

        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to load embed chatbot:', err);
        setError(err.response?.data?.error || 'Không thể tải chatbot này. Vui lòng kiểm tra lại mã nhúng.');
        setIsLoading(false);
      }
    };

    if (id) {
      initEmbedBot();
    }
  }, [id, setActiveChatbot, clearChat]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-600" />
        <p className="text-xs font-medium">Đang khởi tạo khung chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4 text-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {hasMessages ? (
        <>
          <div className="flex-1 overflow-hidden relative">
            <ChatWindow />
          </div>
          <div className="p-4 bg-white border-t border-gray-100">
            <ChatInput chatbotId={id} />
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <StarterPrompts />
          </div>
          <div className="p-4 bg-white border-t border-gray-100">
            <ChatInput chatbotId={id} />
          </div>
        </div>
      )}
      
      {/* Footer / Branding (Optional) */}
      <div className="py-1 px-4 text-[10px] text-gray-400 text-center border-t border-gray-50 bg-gray-50">
        Powered by <span className="font-semibold text-teal-600">LangChain Chatbot</span>
      </div>
    </div>
  );
}

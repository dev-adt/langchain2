'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ChatbotForm from '@/components/chatbots/ChatbotForm';
import { chatbotService } from '@/services/chatbotService';
import { CreateChatbotPayload } from '@/types';

export default function CreateChatbotPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: CreateChatbotPayload) => {
    setIsLoading(true);
    try {
      const chatbot = await chatbotService.createChatbot(data);
      router.push(`/chatbots/${chatbot.id}`);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Tạo Chatbot mới
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Thiết lập chatbot tùy biến với model và system prompt riêng
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <ChatbotForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Tạo Chatbot"
          />
        </div>
      </div>
    </div>
  );
}

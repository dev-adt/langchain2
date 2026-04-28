'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ChatbotForm from '@/components/chatbots/ChatbotForm';
import DatasetUpload from '@/components/chatbots/DatasetUpload';
import EmbedModal from '@/components/chatbots/EmbedModal';
import { chatbotService } from '@/services/chatbotService';
import { Chatbot, CreateChatbotPayload } from '@/types';
import { Code } from 'lucide-react';

export default function EditChatbotPage() {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const fetchChatbot = async () => {
    try {
      const data = await chatbotService.getChatbot(id);
      setChatbot(data);
    } catch (error) {
      console.error('Failed to load chatbot:', error);
      router.push('/chatbots');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchChatbot();
  }, [id]);

  const handleSubmit = async (data: CreateChatbotPayload) => {
    setIsLoading(true);
    try {
      await chatbotService.updateChatbot(id, data);
      router.push('/chatbots');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!chatbot) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chỉnh sửa: {chatbot.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Cập nhật cấu hình và dataset cho chatbot
              </p>
            </div>
          </div>

          {chatbot.isPublic && (
            <button
              onClick={() => setIsEmbedModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-xl font-semibold hover:bg-teal-100 transition-colors border border-teal-100"
            >
              <Code className="w-4 h-4" />
              Mã nhúng
            </button>
          )}
        </div>

        {/* Embed Modal */}
        <EmbedModal 
          isOpen={isEmbedModalOpen} 
          onClose={() => setIsEmbedModalOpen(false)} 
          chatbotId={chatbot.id} 
        />

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Cấu hình
          </h2>
          <ChatbotForm
            initialData={{
              id: chatbot.id,
              name: chatbot.name,
              description: chatbot.description || '',
              systemPrompt: chatbot.systemPrompt,
              model: chatbot.model,
              isPublic: chatbot.isPublic,
              starterPrompts: chatbot.starterPrompts ? JSON.parse(chatbot.starterPrompts) : undefined,
            }}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Lưu thay đổi"
          />
        </div>

        {/* Dataset Upload */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <DatasetUpload
            chatbotId={chatbot.id}
            datasets={chatbot.datasets || []}
            onUploadComplete={fetchChatbot}
          />
        </div>
      </div>
    </div>
  );
}

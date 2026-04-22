'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { chatbotService } from '@/services/chatbotService';
import { Chatbot } from '@/types';
import Button from '@/components/ui/Button';
import {
  Plus,
  Bot,
  MessageSquare,
  Trash2,
  Edit3,
  ArrowLeft,
} from 'lucide-react';

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const data = await chatbotService.getChatbots();
        setChatbots(data);
      } catch (error) {
        console.error('Failed to load chatbots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatbots();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa chatbot này?')) return;
    try {
      await chatbotService.deleteChatbot(id);
      setChatbots((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Failed to delete chatbot:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Custom Chatbots
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Tạo và quản lý chatbot tùy biến của bạn
              </p>
            </div>
          </div>
          <Button onClick={() => router.push('/chatbots/create')} id="create-chatbot-btn">
            <Plus className="w-4 h-4 mr-2" />
            Tạo mới
          </Button>
        </div>

        {/* Chatbot List */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-2xl border border-gray-100 p-6"
              >
                <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-3" />
                <div className="h-4 bg-gray-100 rounded-lg w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : chatbots.length === 0 ? (
          <div className="text-center py-20">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Chưa có chatbot nào
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Tạo chatbot đầu tiên để bắt đầu tùy biến trợ lý AI của bạn
            </p>
            <Button onClick={() => router.push('/chatbots/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo Chatbot mới
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {chatbots.map((bot) => (
              <div
                key={bot.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {bot.name}
                      </h3>
                      <p className="text-xs text-gray-400">{bot.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push(`/chatbots/${bot.id}`)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bot.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {bot.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {bot.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {bot._count?.conversations || 0} cuộc trò chuyện
                  </span>
                  <span>
                    {bot.datasets?.length || 0} dataset
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

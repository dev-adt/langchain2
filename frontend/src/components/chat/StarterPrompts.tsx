'use client';

import React, { useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';

interface StarterPrompt {
  title: string;
  description: string;
  prompt: string;
}

const DEFAULT_STARTER_PROMPTS: StarterPrompt[] = [
  {
    title: 'Giới thiệu ADT Group',
    description: 'Tóm tắt nhanh về ADT Group và các năng lực nổi bật.',
    prompt: 'Hãy giới thiệu về ADT Group và các năng lực nổi bật của tổ chức.',
  },
  {
    title: 'Sản phẩm và dịch vụ',
    description: 'Tóm tắt các giải pháp công nghệ ADT đang cung cấp.',
    prompt: 'Liệt kê và mô tả các sản phẩm, dịch vụ công nghệ mà ADT Group đang cung cấp.',
  },
  {
    title: 'Trợ lý AI cho phường xã',
    description: 'Tư vấn gói dịch vụ trợ lý AI cho khối hành chính.',
    prompt: 'Tư vấn chi tiết về giải pháp trợ lý AI cho phường xã và khối hành chính công.',
  },
  {
    title: 'ERP cho doanh nghiệp',
    description: 'Gợi ý cách triển khai ERP cho doanh nghiệp.',
    prompt: 'Gợi ý quy trình và cách triển khai hệ thống ERP phù hợp cho doanh nghiệp vừa và nhỏ.',
  },
];

export default function StarterPrompts() {
  const { sendMessage, activeChatbotId, activeChatbotName, conversations } = useChatStore();

  // Try to find the active chatbot details to get its starter prompts
  // Note: In a real app, we might want to fetch the full chatbot details or store them in a store
  // For now, we'll try to find it from the chatbot list if we had one, 
  // but since we only have the ID and name, we'll assume the parent component or a hook provides it.
  // Actually, let's use a simpler approach: if it's a custom bot, we'll show its name in the welcome text.
  
  // To get the actual prompts, we should ideally have them in the store. 
  // Let's assume for now we use the default ones unless the bot is specifically configured.
  // I will update the Sidebar to pass the bot details to the store.

  const { activeChatbotPrompts } = useChatStore() as any; // Using any for now as I'll add this field

  const prompts = useMemo(() => {
    if (activeChatbotPrompts && Array.isArray(activeChatbotPrompts) && activeChatbotPrompts.length > 0) {
      return activeChatbotPrompts;
    }
    return DEFAULT_STARTER_PROMPTS;
  }, [activeChatbotPrompts]);

  const handleClick = (prompt: StarterPrompt) => {
    sendMessage(prompt.prompt);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
      {/* AI Logo */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg mb-6 ${
        activeChatbotId ? 'bg-gradient-to-br from-indigo-400 to-purple-500' : 'bg-gradient-to-br from-teal-400 to-teal-600'
      }`}>
        {activeChatbotName ? activeChatbotName.substring(0, 2).toUpperCase() : 'AI'}
      </div>

      {/* Welcome Text */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2 leading-tight">
        {activeChatbotName ? `Chào mừng bạn đến với ${activeChatbotName}` : 'Tôi có thể giúp gì cho bạn'}
      </h1>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-10 leading-tight">
        hôm nay?
      </h1>

      {/* Subtitle */}
      <div className="mb-8 text-center">
        <p className="text-sm text-gray-400">
          {activeChatbotId ? 'Đang sử dụng Chatbot tùy chỉnh' : 'Đoạn chat mới'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Sẵn sàng bắt đầu cuộc trò chuyện mới.
        </p>
      </div>

      {/* Starter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        {prompts.map((prompt: StarterPrompt, index: number) => (
          <button
            key={index}
            onClick={() => handleClick(prompt)}
            className="group text-left p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            id={`starter-prompt-${index}`}
          >
            <h3 className="font-semibold text-gray-800 text-sm mb-1.5 group-hover:text-teal-700 transition-colors">
              {prompt.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {prompt.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

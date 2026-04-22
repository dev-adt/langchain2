'use client';

import React from 'react';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 py-4 px-4 md:px-0 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <Avatar isAI size="sm" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${
            isUser
              ? 'bg-teal-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          }`}
      >
        {/* Render content with basic markdown-like formatting */}
        <div className="whitespace-pre-wrap break-words">
          {content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse rounded-sm" />
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <Avatar name={user?.name} src={user?.avatar} size="sm" />
        </div>
      )}
    </div>
  );
}

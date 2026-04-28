'use client';

import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import MessageBubble from './MessageBubble';
import Avatar from '@/components/ui/Avatar';
import { API_BASE_URL } from '@/services/api';

export default function ChatWindow() {
  const { messages, isStreaming, streamingContent, activeChatbotName, activeChatbotAvatar } = useChatStore();
  
  const baseUrl = API_BASE_URL.replace('/api', '');
  const avatarUrl = activeChatbotAvatar ? `${baseUrl}${activeChatbotAvatar}` : null;

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, streamingContent]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      id="chat-window"
    >
      <div className="max-w-3xl mx-auto py-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role as 'user' | 'assistant'}
            content={message.content}
            botAvatar={avatarUrl}
            botName={activeChatbotName}
          />

        ))}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <MessageBubble
            role="assistant"
            content={streamingContent}
            isStreaming={true}
            botAvatar={avatarUrl}
            botName={activeChatbotName}
          />

        )}

        {/* Loading indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex gap-3 py-4 px-4 md:px-0 justify-start">
            <div className="flex-shrink-0 mt-1">
              <Avatar isAI name={activeChatbotName || 'AI'} src={avatarUrl} size="sm" />
            </div>

            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

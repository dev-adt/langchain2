'use client';

import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import MessageBubble from './MessageBubble';

export default function ChatWindow() {
  const { messages, isStreaming, streamingContent } = useChatStore();
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
          />
        ))}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <MessageBubble
            role="assistant"
            content={streamingContent}
            isStreaming={true}
          />
        )}

        {/* Loading indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex gap-3 py-4 px-4 md:px-0 justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
              AI
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

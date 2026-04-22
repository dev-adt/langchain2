'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Square } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

interface ChatInputProps {
  conversationId?: string;
  chatbotId?: string;
}

export default function ChatInput({ conversationId, chatbotId }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming, stopStreaming } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed, conversationId, chatbotId);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <div className="relative flex items-end gap-2 bg-white rounded-2xl border border-gray-200 shadow-lg px-3 py-2 focus-within:border-teal-300 focus-within:shadow-teal-100/50 transition-all duration-200">
        {/* Attach Button */}
        <button
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 self-end mb-0.5"
          title="Đính kèm file"
          id="attach-btn"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi chatbot bất cứ điều gì..."
          className="flex-1 resize-none bg-transparent py-2.5 px-1 text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm leading-relaxed max-h-[200px]"
          disabled={isStreaming}
          id="chat-input"
        />

        {/* Send / Stop Button */}
        {isStreaming ? (
          <button
            onClick={stopStreaming}
            className="p-2.5 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors flex-shrink-0 self-end mb-0.5"
            title="Dừng"
            id="stop-btn"
          >
            <Square className="w-4 h-4" fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 self-end mb-0.5
              ${
                input.trim()
                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            id="send-btn"
          >
            Gửi đi
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-400 mt-2.5">
        Chatbot có thể mắc lỗi. Hãy kiểm tra lại các thông tin quan trọng.
      </p>
    </div>
  );
}

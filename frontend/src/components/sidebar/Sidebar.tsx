'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  MessageSquarePlus,
  LogOut,
  Menu,
  X,
  Bot,
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useSidebarStore } from '@/store/sidebarStore';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { chatbotService } from '@/services/chatbotService';
import { Chatbot } from '@/types';
import ConversationList from './ConversationList';

export default function Sidebar() {
  const { isOpen, toggle, close } = useSidebarStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { clearChat, activeChatbotId, setActiveChatbot, switchChatbot } = useChatStore();
  const router = useRouter();
  const pathname = usePathname();

  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [showBots, setShowBots] = useState(true);

  // Load chatbots
  useEffect(() => {
    if (isAuthenticated) {
      chatbotService.getChatbots().then(setChatbots).catch(console.error);
    }
  }, [isAuthenticated]);

  const handleNewChat = () => {
    clearChat();
    router.push('/');
    if (window.innerWidth < 1024) close();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleManageBots = () => {
    router.push('/chatbots');
    if (window.innerWidth < 1024) close();
  };

  const handleSelectBot = (bot: Chatbot) => {
    let prompts = null;
    if (bot.starterPrompts) {
      try {
        prompts = JSON.parse(bot.starterPrompts);
      } catch (e) {
        console.error('Failed to parse starter prompts', e);
      }
    }
    switchChatbot(bot.id, bot.name, prompts);
    router.push('/');
    if (window.innerWidth < 1024) close();
  };

  const handleDefaultAssistant = () => {
    switchChatbot(null, null);
    router.push('/');
    if (window.innerWidth < 1024) close();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={toggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all"
        id="sidebar-toggle"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-[#eaf3f1] flex flex-col transition-all duration-300 ease-in-out border-r border-black/5
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}`}
        id="sidebar"
      >
        <div className="flex flex-col h-full min-w-[288px]">
          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 hover:bg-white text-gray-700 font-medium shadow-sm hover:shadow transition-all duration-200 border border-gray-200/50"
              id="new-chat-btn"
            >
              <MessageSquarePlus className="w-5 h-5 text-teal-600" />
              <span>Đoạn chat mới</span>
            </button>
          </div>

          {/* My Chatbots Section */}
          {chatbots.length > 0 && (
            <div className="px-3 mb-2">
              <button
                onClick={() => setShowBots(!showBots)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-500/70 uppercase tracking-wider hover:text-gray-600 transition-colors"
              >
                <span>Chatbots của tôi</span>
                {showBots ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showBots && (
                <div className="space-y-0.5 mt-1">
                  {/* Default Assistant */}
                  <button
                    onClick={handleDefaultAssistant}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-all duration-150
                      ${!activeChatbotId
                        ? 'bg-white shadow-sm text-gray-900 font-medium'
                        : 'text-gray-700 hover:bg-white/60'
                      }`}
                    id="default-assistant"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      AI
                    </div>
                    <span className="truncate">Trợ lý mặc định</span>
                  </button>

                  {/* Custom Bots */}
                  {chatbots.map((bot) => (
                    <button
                      key={bot.id}
                      onClick={() => handleSelectBot(bot)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-all duration-150
                        ${activeChatbotId === bot.id
                          ? 'bg-white shadow-sm text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-white/60'
                        }`}
                      id={`bot-${bot.id}`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate flex-1">{bot.name}</span>
                      {activeChatbotId === bot.id && (
                        <Sparkles className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}

                  {/* Quick create */}
                  <button
                    onClick={handleManageBots}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-gray-400 hover:text-teal-600 hover:bg-white/40 transition-all"
                    id="quick-create-bot"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo bot mới...</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            <ConversationList />
          </div>

          {/* Custom Bots Management Link */}
          <div className="px-3 py-2">
            <button
              onClick={handleManageBots}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200
                ${pathname?.startsWith('/chatbots')
                  ? 'bg-teal-500/10 text-teal-700 font-medium'
                  : 'text-gray-600 hover:bg-white/60'
                }`}
              id="manage-bots-btn"
            >
              <Bot className="w-5 h-5" />
              <span>Quản lý Chatbot</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="p-3 border-t border-black/5">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                title="Đăng xuất"
                id="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

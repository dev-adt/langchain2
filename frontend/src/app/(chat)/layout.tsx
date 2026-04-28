'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useSidebarStore } from '@/store/sidebarStore';
import { MessageSquarePlus } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { API_BASE_URL } from '@/services/api';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const { isOpen } = useSidebarStore();
  const { clearChat, activeChatbotName, activeChatbotAvatar } = useChatStore();
  const router = useRouter();

  const baseUrl = API_BASE_URL.replace('/api', '');
  const avatarUrl = activeChatbotAvatar ? `${baseUrl}${activeChatbotAvatar}` : null;


  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm h-16">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0 overflow-hidden border border-teal-50">
              {avatarUrl ? (
                <img src={avatarUrl} alt={activeChatbotName || 'Bot'} className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/></svg>
              )}
            </div>

            <div className="overflow-hidden min-w-0">
              <h2 className="text-sm font-semibold text-gray-800 truncate">
                {activeChatbotName || 'AI Assistant'}
              </h2>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Đang hoạt động
              </p>
            </div>
          </div>


          <button
            onClick={() => {
              clearChat();
              router.push('/');
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all flex-shrink-0"
            id="header-new-chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Chat mới
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

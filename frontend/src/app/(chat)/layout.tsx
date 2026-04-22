'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useSidebarStore } from '@/store/sidebarStore';
import { MessageSquarePlus } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const { isOpen } = useSidebarStore();
  const { clearChat } = useChatStore();
  const router = useRouter();

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
        <header className="flex items-center justify-end px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <button
            onClick={() => {
              clearChat();
              router.push('/');
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all"
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

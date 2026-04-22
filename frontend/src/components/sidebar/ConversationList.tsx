'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useSidebarStore } from '@/store/sidebarStore';

export default function ConversationList() {
  const {
    conversations,
    activeConversationId,
    loadConversations,
    setActiveConversation,
    deleteConversation,
    isLoadingConversations,
  } = useChatStore();
  const { close } = useSidebarStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Group conversations by time
  const grouped = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    const groups: {
      label: string;
      items: typeof conversations;
    }[] = [
        { label: 'Hôm nay', items: [] },
        { label: 'Hôm qua', items: [] },
        { label: '7 ngày trước', items: [] },
        { label: 'Cũ hơn', items: [] },
      ];

    conversations.forEach((conv) => {
      const date = new Date(conv.updatedAt || conv.createdAt);
      if (date >= today) {
        groups[0].items.push(conv);
      } else if (date >= yesterday) {
        groups[1].items.push(conv);
      } else if (date >= weekAgo) {
        groups[2].items.push(conv);
      } else {
        groups[3].items.push(conv);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [conversations]);

  const handleClick = (id: string) => {
    setActiveConversation(id);
    router.push(`/c/${id}`);
    if (window.innerWidth < 1024) close();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Attempting to delete conversation:', id);
    if (confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này?')) {
      try {
        await deleteConversation(id);
        if (activeConversationId === id || pathname === `/c/${id}`) {
          router.push('/');
        }
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Không thể xóa cuộc trò chuyện. Vui lòng thử lại.');
      }
    }
  };

  if (isLoadingConversations) {
    return (
      <div className="space-y-3 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 bg-white/40 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-sm text-gray-500/80">
          Chưa có cuộc trò chuyện nào.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Bắt đầu một cuộc trò chuyện mới ngay bây giờ!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-gray-500/70 uppercase tracking-wider px-3 mb-1.5">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((conv) => {
              const isActive =
                activeConversationId === conv.id ||
                pathname === `/c/${conv.id}`;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleClick(conv.id)}
                  className={`w-full group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-150 cursor-pointer relative
                    ${isActive
                      ? 'bg-white shadow-sm text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-white/60'
                    }`}
                  id={`conversation-${conv.id}`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span className="truncate flex-1 pr-8">{conv.title}</span>
                  <div
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all z-20"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

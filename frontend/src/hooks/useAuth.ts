'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useAuth(requireAuth: boolean = true) {
  const { user, isAuthenticated, loadFromStorage, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [requireAuth, isAuthenticated, router]);

  return { user, isAuthenticated, logout };
}

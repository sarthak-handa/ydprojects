'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/Layout/AppLayout';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady || !isAuthenticated) return null;

  return <AppLayout>{children}</AppLayout>;
}

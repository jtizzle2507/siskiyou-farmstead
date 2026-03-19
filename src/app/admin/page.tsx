'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminLogin from './AdminLogin';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/admin/products');
  }, [user, router]);

  if (user) return null;
  return <AdminLogin />;
}

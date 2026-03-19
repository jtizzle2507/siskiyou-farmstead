'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminGuard({ children, activeTab }: { children: ReactNode; activeTab: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace('/admin');
  }, [user, router]);

  if (!user) return null;

  const tabs = [
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'blog', label: 'Blog' },
    { key: 'subscribers', label: 'Subscribers' },
    { key: 'users', label: 'Users' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">View Site</Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.username}</span>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-800">Logout</button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            {tabs.map(tab => (
              <Link
                key={tab.key}
                href={`/admin/${tab.key}`}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-b-2 border-green-700 text-green-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

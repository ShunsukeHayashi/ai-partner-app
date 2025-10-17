'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { CharacterGrid } from '@/components/dashboard/CharacterGrid';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    // Only check auth once on mount
    checkAuth();
  }, []); // Empty dependency array - run once on mount

  useEffect(() => {
    // Redirect if user is null after auth check
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Partner Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                理想のパートナーと一緒に恋愛体験を楽しもう
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.username}さん
                </p>
                <p className="text-xs text-gray-500">
                  ようこそ！
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CharacterGrid />
      </main>
    </div>
  );
}

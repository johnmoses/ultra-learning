'use client';

import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  BookOpenIcon, 
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Learning', href: '/learning', icon: BookOpenIcon },
  { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Engagement', href: '/engagement', icon: ChartBarIcon },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="flex flex-col h-screen">
            <div className="flex items-center h-16 px-4 border-b">
              <h1 className="text-xl font-bold text-gray-900">UltraLearning</h1>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    pathname.startsWith(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t">
              <div className="flex items-center">
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <Link href="/help" className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50">
                  Help Center
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
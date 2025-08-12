'use client';

import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { BookOpenIcon, ChatBubbleLeftRightIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              UltraLearning
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.username}</span>
                  <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 hover:text-gray-900">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            AI-Powered Learning Platform
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Experience personalized education with advanced AI technology, real-time chat assistance, and comprehensive progress tracking.
          </p>
          
          {!user && (
            <div className="mt-8">
              <Link href="/auth/register" className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700">
                Start Learning Today
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <BookOpenIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Learning</h3>
            <p className="text-gray-600">Engage with courses designed for optimal knowledge retention and skill development.</p>
          </div>
          
          <div className="text-center">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Chat Assistant</h3>
            <p className="text-gray-600">Get instant help and personalized guidance from our intelligent AI tutor.</p>
          </div>
          
          <div className="text-center">
            <ChartBarIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Analytics</h3>
            <p className="text-gray-600">Track your learning journey with detailed analytics and achievement systems.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="/help" className="hover:text-gray-900">Help Center</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact Us</Link>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">
            © 2024 UltraLearning. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/xlib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrophyIcon, FireIcon, ClockIcon } from '@heroicons/react/24/outline';

interface EngagementData {
  total_points: number;
  streak_days: number;
  time_spent_today: number;
  weekly_activity: Array<{
    day: string;
    points: number;
  }>;
  category_breakdown: Array<{
    category: string;
    points: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earned_at: string;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Engagement() {
  const [data, setData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    try {
      const response = await api.get('/engagement/overview');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow h-64"></div>
            <div className="bg-white p-6 rounded-lg shadow h-64"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Engagement</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrophyIcon className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Points</h3>
                <p className="text-2xl font-bold text-gray-900">{data?.total_points || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FireIcon className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Streak Days</h3>
                <p className="text-2xl font-bold text-gray-900">{data?.streak_days || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Time Today</h3>
                <p className="text-2xl font-bold text-gray-900">{data?.time_spent_today || 0}m</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.weekly_activity || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="points" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Points by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.category_breakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="points"
                  >
                    {(data?.category_breakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Recent Achievements</h3>
          </div>
          <div className="p-6">
            {data?.achievements && data.achievements.length > 0 ? (
              <div className="space-y-4">
                {data.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center p-4 bg-yellow-50 rounded-lg">
                    <TrophyIcon className="w-8 h-8 text-yellow-500" />
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h4>
                <p className="text-gray-500">Keep learning to unlock your first achievement!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import  api  from '@/xlib/api';
import { BookOpenIcon, PlayIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FlashcardPack {
  id: number;
  title: string;
  description: string;
  flashcards: Array<{
    id: number;
    question: string;
    answer: string;
  }>;
}

export default function Learning() {
  const [packs, setPacks] = useState<FlashcardPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await api.get('/learning/packs');
      setPacks(response.data);
    } catch (error) {
      console.error('Failed to fetch flashcard packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setCreating(true);
    try {
      const response = await api.post('/learning/packs', {
        title: title.trim(),
        description: description.trim()
      });
      setPacks([...packs, response.data]);
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      toast.success('Pack created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create pack');
    } finally {
      setCreating(false);
    }
  };



  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-48"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Flashcard Packs</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Pack
          </button>
        </div>

        {/* Flashcard Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <div key={pack.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{pack.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{pack.description || 'No description'}</p>
                
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>{pack.flashcards?.length || 0} cards</span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/learning/pack/${pack.id}`}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Study
                  </Link>
                  <Link
                    href={`/learning/pack/${pack.id}/edit`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {packs.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcard packs yet</h3>
            <p className="text-gray-500">Create your first flashcard pack to start learning!</p>
          </div>
        )}
      </div>

      {/* Create Pack Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Pack</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={createPack}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter pack title"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter pack description (optional)"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Pack'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
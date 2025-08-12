'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/xlib/api';
import { 
  PlusIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  member_count: number;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

export default function Chat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/chat/rooms');
      const roomsData = response.data.map((room: any) => ({
        id: room.id.toString(),
        name: room.name,
        description: room.description || '',
        member_count: room.participants?.length || 0,
        is_private: room.is_private || false,
        created_by: room.created_by || 'user',
        created_at: room.created_at
      }));
      setRooms(roomsData);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    
    setCreating(true);
    try {
      const response = await api.post('/chat/rooms', {
        name: roomName.trim(),
        description: roomDescription.trim(),
        is_private: isPrivate
      });
      
      const newRoom: ChatRoom = {
        id: response.data.id.toString(),
        name: response.data.name,
        description: roomDescription.trim(),
        member_count: 1,
        is_private: isPrivate,
        created_by: user?.username || 'user',
        created_at: response.data.created_at
      };
      
      setRooms([newRoom, ...rooms]);
      setShowCreateModal(false);
      setRoomName('');
      setRoomDescription('');
      setIsPrivate(false);
      toast.success('Room created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to create room');
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
              <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Chat Rooms</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Room
          </button>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <HashtagIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  </div>
                  {room.is_private && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Private
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {room.description || 'No description'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-1" />
                    <span>{room.member_count} members</span>
                  </div>
                  <span>by {room.created_by}</span>
                </div>

                <Link
                  href={`/chat/room/${room.id}`}
                  className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                  Join Room
                </Link>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chat rooms yet</h3>
            <p className="text-gray-500">Create the first room to start chatting!</p>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Room</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={createRoom}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room description (optional)"
                  rows={3}
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Make this room private</span>
                </label>
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
                  disabled={creating || !roomName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
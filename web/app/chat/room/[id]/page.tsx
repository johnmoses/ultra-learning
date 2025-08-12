'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import api from '@/xlib/api';
import { 
  PaperAirplaneIcon, 
  ArrowLeftIcon,
  UserGroupIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  sender: string;
  sender_id: any;
  sender_type: 'user' | 'ai';
  timestamp: string;
}

interface OnlineUser {
  id: string;
  username: string;
  status: 'online' | 'away';
}

export default function ChatRoom() {
  const params = useParams();
  const roomId = params.id;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [roomName, setRoomName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRoomData();
    setupSocket();
    
    return () => {
      socket?.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRoomData = async () => {
    try {
      // Fetch room messages
      const messagesResponse = await api.get(`/chat/rooms/${roomId}/messages`);
      const messagesData = messagesResponse.data.map((msg: any) => ({
        id: msg.id.toString(),
        content: msg.content,
        sender: msg.role === 'assistant' ? 'AI Assistant' : (msg.sender?.username || user?.username || 'User'),
        sender_id: msg.sender_id?.toString() || '0',
        sender_type: msg.role === 'assistant' ? 'ai' : 'user',
        timestamp: msg.timestamp
      }));
      setMessages(messagesData);
    } catch (error: any) {
      console.error('Failed to fetch room data:', error);
      // Fallback: Set welcome message
      setMessages([{
        id: '1',
        content: 'Welcome to the chat room! Start the conversation.',
        sender: 'System',
        sender_id: '0',
        sender_type: 'ai',
        timestamp: new Date().toISOString()
      }]);
    }
    
    // Always set room name and users regardless of API status
    setRoomName(getRoomName(roomId as string));
    setOnlineUsers([{ id: '1', username: user?.username || 'You', status: 'online' }]);
  };

  const getRoomName = (id: string) => {
    const roomNames: { [key: string]: string } = {
      '1': 'General Discussion',
      '2': 'Study Group', 
      '3': 'AI Assistant'
    };
    return roomNames[id] || `Room ${id}`;
  };

  const setupSocket = () => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001');
    setSocket(socketInstance);

    socketInstance.emit('join_room', roomId);

    socketInstance.on('message_update', (data: { messages: Message[] }) => {
      setMessages(data.messages);
    });

    socketInstance.on('user_joined', (userData: OnlineUser) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.id === userData.id);
        return exists ? prev : [...prev, userData];
      });
    });

    socketInstance.on('user_left', (userId: string) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: user?.username || 'You',
      sender_id: user?.id || '0',
      sender_type: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Try to send to API
      const response = await api.post(`/chat/rooms/${roomId}/post_message`, {
        content: messageContent,
        role: 'user'
      });
      
      // Update with full conversation if API works
      const messagesData = response.data.conversation.map((msg: any) => ({
        id: msg.id.toString(),
        content: msg.content,
        sender: msg.role === 'assistant' ? 'AI Assistant' : (msg.sender?.username || user?.username || 'User'),
        sender_id: msg.sender_id?.toString() || user?.id || '0',
        sender_type: msg.role === 'assistant' ? 'ai' : 'user',
        timestamp: msg.timestamp
      }));
      setMessages(messagesData);
      
      socket?.emit('message_sent', {
        room_id: roomId,
        messages: messagesData
      });
    } catch (error: any) {
      console.error('API failed, using offline mode:', error);
      
      // Add a simple AI response for offline mode
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: 'I received your message! (Note: AI features are currently offline)',
          sender: 'AI Assistant',
          sender_id: '0',
          sender_type: 'ai',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/chat" className="mr-4 p-1 hover:bg-gray-100 rounded">
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">#{roomName}</h1>
                <p className="text-sm text-gray-500">{onlineUsers.length} members online</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded">
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => {
              const isOwner = message.sender_id === user?.id || message.sender === user?.username;
              const isAI = message.sender_type === 'ai';
              
              if (isOwner) {
                // Owner messages - right aligned
                return (
                  <div key={message.id} className="flex justify-end mb-4">
                    <div className="max-w-xs lg:max-w-md">
                      <div className="flex items-center justify-end space-x-2 mb-1">
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="font-medium text-blue-700">You</span>
                      </div>
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg rounded-br-sm">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Other users and AI messages - left aligned
                return (
                  <div key={message.id} className="flex items-start space-x-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      isAI ? 'bg-purple-500' : 'bg-gray-500'
                    }`}>
                      {message.sender[0]?.toUpperCase()}
                    </div>
                    <div className="max-w-xs lg:max-w-md">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`font-medium ${
                          isAI ? 'text-purple-700' : 'text-gray-900'
                        }`}>
                          {message.sender}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={`px-4 py-2 rounded-lg rounded-bl-sm ${
                        isAI 
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-white text-gray-900 border'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t p-4">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message #${roomName.toLowerCase()}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Online Users Sidebar */}
        <div className="w-64 bg-white border-l">
          <div className="p-4 border-b">
            <div className="flex items-center">
              <UserGroupIcon className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-medium text-gray-900">Online ({onlineUsers.length})</h3>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.username[0]?.toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    user.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
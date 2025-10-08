import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

interface Message {
  _id: string;
  courseId: string;
  senderId: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  text: string;
  timestamp: string;
}

interface ChatRoomProps {
  courseId: string;
  courseTitle: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ courseId, courseTitle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, token } = useAuth();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!token || !user) {
      console.log('❌ No token or user, skipping Socket.IO connection');
      return;
    }

    console.log('🔌 Initializing Socket.IO connection...');
    console.log('📡 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000');
    console.log('👤 User:', user.username);

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.IO');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔥 Socket.IO connection error:', error);
      setError(`Connection failed: ${error.message}`);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('⚠️ Socket.IO error:', error);
      setError(error.message || 'Socket error occurred');
    });

    newSocket.on('joined-course', (data) => {
      console.log('🏠 Joined course room:', data);
    });

    newSocket.on('new-message', (message: Message) => {
      console.log('💬 New message received:', message);
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Closing Socket.IO connection');
      newSocket.close();
    };
  }, [token, user]);

  // Join course room when socket is connected
  useEffect(() => {
    if (socket && isConnected && courseId) {
      console.log('🏠 Attempting to join course room:', courseId);
      socket.emit('join-course', courseId);
    }
  }, [socket, isConnected, courseId]);

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }

        const chatHistory = await response.json();
        setMessages(chatHistory);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setError('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [courseId, token]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !socket || !isConnected) {
      console.log('❌ Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasSocket: !!socket, 
        isConnected 
      });
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      console.log('📤 Sending message:', { courseId, text: messageText });
      socket.emit('send-message', {
        courseId,
        text: messageText
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError('Failed to send message');
      // Restore message if sending failed
      setNewMessage(messageText);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket && courseId) {
        socket.emit('leave-course', courseId);
      }
    };
  }, [socket, courseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading chat...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="font-semibold text-gray-800">Course Chat</h3>
          <span className="text-sm text-gray-500">- {courseTitle}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId._id === user?.id;
            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="flex items-center space-x-2 mb-1">
                      {message.senderId.profilePicture ? (
                        <img
                          src={message.senderId.profilePicture}
                          alt={message.senderId.username}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {message.senderId.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-600">
                        {message.senderId.username}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatRoom;

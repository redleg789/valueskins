import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { clearDemoSession, getDemoToken } from '@/lib/demoSession';
import { demoUserIdFromToken } from '@/lib/demoMode';

interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  participantAvatars: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: { [key: string]: number };
  otherParticipantId?: string;
  otherParticipantName?: string;
  otherParticipantAvatar?: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export default function Chat() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUserId = (() => {
    const token = getDemoToken();
    return token ? demoUserIdFromToken(token) : '';
  })();

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const token = getDemoToken();
      const response = await fetch('/api/messages?action=conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const token = getDemoToken();
      const response = await fetch(`/api/messages?action=messages&conversationId=${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMessages(data);

      // Mark conversation as read
      await fetch('/api/messages?action=mark-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId }),
      });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    const token = getDemoToken();
    try {
      const response = await fetch('/api/messages?action=send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageText,
          recipientId: selectedConversation.otherParticipantId,
          recipientName: selectedConversation.otherParticipantName,
          recipientAvatar: selectedConversation.otherParticipantAvatar,
        }),
      });

      if (response.ok) {
        setMessageText('');
        fetchMessages(selectedConversation.id);
        fetchConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Messages</h2>
          <button
            onClick={() => {
              clearDemoSession();
              router.push('/auth/login');
            }}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            conversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full p-4 border-b border-gray-700 hover:bg-gray-900/50 text-left transition ${
                  selectedConversation?.id === conversation.id ? 'bg-gray-900' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{conversation.otherParticipantAvatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{conversation.otherParticipantName}</p>
                    <p className="text-gray-500 text-sm truncate">{conversation.lastMessage}</p>
                    <p className="text-gray-600 text-xs">
                      {new Date(conversation.lastMessageTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {conversation.unreadCount && conversation.unreadCount[currentUserId] > 0 && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="border-b border-gray-700 p-4 flex items-center gap-3">
              <div className="text-4xl">{selectedConversation.otherParticipantAvatar}</div>
              <div>
                <h3 className="font-bold">{selectedConversation.otherParticipantName}</h3>
                <p className="text-gray-500 text-sm">Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">No messages yet. Start the conversation!</div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.senderId === currentUserId
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Say something..."
                  className="flex-1 bg-gray-900 text-white rounded-full px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold"
                >
                  📤
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-2xl mb-2">💬</p>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

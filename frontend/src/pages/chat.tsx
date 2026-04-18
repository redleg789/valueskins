import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  timestamp: string;
  deal_id: number;
}

interface Conversation {
  id: number;
  deal_id: number;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function Chat() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchUser(token);
    fetchConversations(token);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const token = localStorage.getItem('auth_token');
      if (token) fetchMessages(token, selectedConversation);
    }
  }, [selectedConversation]);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchConversations = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data.conversations || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (token: string, conversationId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: selectedConversation,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        const token = localStorage.getItem('auth_token');
        if (token) fetchMessages(token, selectedConversation);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition ${
                  selectedConversation === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <p className="font-semibold">{conv.other_user_name}</p>
                <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(conv.last_message_time).toLocaleDateString()}</p>
                {conv.unread_count > 0 && (
                  <span className="inline-block bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mt-2">
                    {conv.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold">
                {conversations.find((c) => c.id === selectedConversation)?.other_user_name}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { encrypt, decrypt, initEncryption, isEncryptionReady } from '@/lib/encryption';

export default function Chat() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
    }
    initEncryption();
    setReady(true);
    setSelectedConversation('artisan-studios');
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  const conversations = [
    { id: 'artisan-studios', name: 'Artisan Studios', lastMessage: 'Thanks for the collaboration!', time: '2m ago', unread: 2 },
    { id: 'neon-dreams', name: 'Neon Dreams', lastMessage: 'The artwork looks amazing', time: '1h ago', unread: 0 },
    { id: 'creative-co', name: 'Creative Co', lastMessage: 'When can we discuss the proposal?', time: '3h ago', unread: 0 },
  ];

  const messages = [
    { id: '1', from: 'them', content: 'Hi! Thanks for accepting the collaboration request.', time: '10:30 AM' },
    { id: '2', from: 'me', content: 'Hey! Excited to work on this project. What do you have in mind?', time: '10:32 AM' },
    { id: '3', from: 'them', content: 'We were thinking a series of 5 posts showcasing our new art supplies.', time: '10:35 AM' },
    { id: '4', from: 'them', content: 'Each post should highlight a different product from our collection.', time: '10:36 AM' },
    { id: '5', from: 'me', content: 'Sounds great! I can create some time-lapse videos showing the supplies in action.', time: '10:40 AM' },
    { id: '6', from: 'them', content: 'Perfect! That aligns with our brand perfectly.', time: '10:42 AM' },
    { id: '7', from: 'them', content: 'Thanks for the collaboration!', time: '10:45 AM' },
  ];

  const handleSend = async () => {
    if (!message.trim()) return;
    
    try {
      const encrypted = await encrypt(message);
      console.log('Encrypted message:', encrypted);
      setMessage('');
    } catch (error) {
      console.error('Encryption failed:', error);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20 md:ml-80">
        <div className="flex justify-between items-center px-6 h-20">
          <span className="text-2xl font-black italic text-primary font-headline">Messages</span>
          <button className="text-primary hover:text-primary-dim transition-colors">
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>
      </header>

      <div className="flex pt-20 w-full">
        {/* Conversations List */}
        <aside className="hidden md:block w-80 bg-surface border-r border-zinc-800/20 fixed left-0 top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="p-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full bg-surface-container-highest px-4 py-2 pl-10 rounded-sm border border-outline-variant/50 focus:border-primary focus:ring-0 text-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">search</span>
            </div>
          </div>
          
          <div className="space-y-1 px-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 rounded-sm transition-colors flex items-center gap-3 ${selectedConversation === conv.id ? 'bg-surface-container-high' : 'hover:bg-surface-container-low'}`}
              >
                <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden flex-shrink-0">
                  <img alt={conv.name} className="w-full h-full object-cover" src="https://via.placeholder.com/48" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-headline font-bold text-sm">{conv.name}</span>
                    <span className="text-xs text-on-surface-variant">{conv.time}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 md:ml-80 flex flex-col h-[calc(100vh-5rem)]">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-outline-variant flex items-center gap-4">
                <button className="md:hidden text-primary" onClick={() => setSelectedConversation(null)}>
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
                  <img alt="User" className="w-full h-full object-cover" src="https://via.placeholder.com/40" />
                </div>
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-primary">Artisan Studios</h3>
                  <p className="text-xs text-on-surface-variant">Active now</p>
                </div>
                <button className="text-primary hover:text-primary-dim transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-sm ${
                        msg.from === 'me'
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container'
                      }`}
                    >
                      <p className="mb-1">{msg.content}</p>
                      <p className={`text-xs ${msg.from === 'me' ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-outline-variant">
                <div className="flex gap-3">
                  <button className="text-secondary hover:text-primary transition-colors p-2">
                    <span className="material-symbols-outlined">attach_file</span>
                  </button>
                  <button className="text-secondary hover:text-primary transition-colors p-2">
                    <span className="material-symbols-outlined">image</span>
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-surface-container-highest px-4 py-2 rounded-sm border border-outline-variant/50 focus:border-primary focus:ring-0"
                  />
                  <button
                    onClick={handleSend}
                    className="bg-primary text-on-primary px-6 py-2 rounded-sm font-headline font-bold hover:bg-primary-dim transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">chat</span>
                <p className="text-on-surface-variant">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
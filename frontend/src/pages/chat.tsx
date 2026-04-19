import { useState } from 'react';

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState<string | null>('nike');
  const [messageText, setMessageText] = useState('');

  const chats = [
    { id: 'nike', name: 'Nike', icon: '🏃', lastMessage: 'Excited to work with you!', time: '2h' },
    { id: 'apple', name: 'Apple', icon: '🍎', lastMessage: 'When can you start?', time: '4h' },
    { id: 'sarah', name: 'Sarah Chen', icon: '👩‍🎨', lastMessage: 'Thanks for the opportunity', time: '1h' },
  ];

  const messages = [
    { id: 1, sender: 'Nike', text: 'Hi! We loved your application', own: false },
    { id: 2, sender: 'You', text: 'Thank you! I\'m excited about this', own: true },
    { id: 3, sender: 'Nike', text: 'When can you film the content?', own: false },
    { id: 4, sender: 'You', text: 'I\'m free next week', own: true },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full p-4 border-b border-gray-700 hover:bg-gray-900/50 text-left transition ${
                selectedChat === chat.id ? 'bg-gray-900' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{chat.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{chat.name}</p>
                  <p className="text-gray-500 text-sm truncate">{chat.lastMessage}</p>
                  <p className="text-gray-600 text-xs">{chat.time} ago</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="border-b border-gray-700 p-4 flex items-center gap-3">
              <div className="text-4xl">{chats.find(c => c.id === selectedChat)?.icon}</div>
              <div>
                <h3 className="font-bold">{chats.find(c => c.id === selectedChat)?.name}</h3>
                <p className="text-gray-500 text-sm">Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.own ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      msg.own
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Say something..."
                  className="flex-1 bg-gray-900 text-white rounded-full px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  📤
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

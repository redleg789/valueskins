export default function Notifications() {
  const notifications = [
    { id: 1, type: 'opportunity', title: 'Nike sent you an opportunity', subtitle: 'Air Max Campaign - $2,500', icon: '🏃', time: '2h ago', read: false },
    { id: 2, type: 'application', title: 'Your application was accepted', subtitle: 'Apple - Product Demo', icon: '🍎', time: '4h ago', read: false },
    { id: 3, type: 'message', title: 'New message from Sarah Chen', subtitle: 'Thanks for connecting!', icon: '👩‍🎨', time: '1h ago', read: true },
    { id: 4, type: 'payment', title: 'Payment received', subtitle: '$2,500 from Nike campaign', icon: '💰', time: '1d ago', read: true },
    { id: 5, type: 'follow', title: 'Alex Rivers followed you', subtitle: '@alexrivers', icon: '👨‍💻', time: '2d ago', read: true },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-gray-700 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 max-w-6xl mx-auto">
        <div className="col-span-3 border-r border-gray-700 p-4 hidden lg:block">
          <nav className="space-y-4">
            <a href="/" className="block text-xl font-bold hover:text-blue-400">🏠 Home</a>
            <a href="/discover" className="block text-xl hover:text-blue-400">🔍 Discover</a>
            <a href="/notifications" className="block text-xl hover:text-blue-400">🔔 Notifications</a>
            <a href="/chat" className="block text-xl hover:text-blue-400">💬 Messages</a>
            <a href="/creator/profile" className="block text-xl hover:text-blue-400">👤 Profile</a>
          </nav>
        </div>

        <div className="col-span-12 lg:col-span-6 border-r border-gray-700">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`border-b border-gray-700 p-4 hover:bg-gray-900/50 cursor-pointer transition ${
                !notif.read ? 'bg-gray-900/20' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className="text-4xl">{notif.icon}</div>
                <div className="flex-1">
                  <p className="font-bold">{notif.title}</p>
                  <p className="text-gray-500 text-sm">{notif.subtitle}</p>
                  <p className="text-gray-600 text-xs mt-1">{notif.time}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-3 p-4 hidden lg:block">
          <div className="bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold mb-4">Notification Settings</h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>Opportunities</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>Applications</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>Messages</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>Payments</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

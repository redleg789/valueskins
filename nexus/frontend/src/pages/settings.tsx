'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  allowMessages: string;
  allowComments: boolean;
  weeklyDigest: boolean;
}

interface UserAccount {
  name: string;
  email: string;
  twoFactorEnabled: boolean;
}

interface Session {
  id: string;
  createdAt: string;
  lastActivityAt: string;
  ipAddress?: string;
  userAgent?: string;
}

interface LoginRecord {
  timestamp: string;
  ip: string;
  device: string;
}

export default function Settings() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [activeSection, setActiveSection] = useState<'account' | 'privacy' | 'notifications' | 'security' | 'content' | 'support' | 'danger'>('account');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [saved, setSaved] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [newEmail, setNewEmail] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [quietHours, setQuietHours] = useState({ start: '', end: '' });
  const [language, setLanguage] = useState('en');
  const [mediaAutoplay, setMediaAutoplay] = useState('always');

  useEffect(() => {
    setReady(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      setSettings({
        emailNotifications: false,
        pushNotifications: false,
        inAppNotifications: false,
        allowMessages: 'everyone',
        allowComments: true,
        weeklyDigest: false,
      });
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    const fetchAccount = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAccount({ name: data.name, email: data.email, twoFactorEnabled: data.twoFactorEnabled });
          setNewEmail(data.email);
        }
      } catch (error) {
        console.error('Failed to fetch account:', error);
      }
    };

    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/security/sessions', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions || []);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };

    const fetchLoginHistory = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/security/login-history', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setLoginHistory(data.loginHistory || []);
        }
      } catch (error) {
        console.error('Failed to fetch login history:', error);
      }
    };

    const fetchQuietHours = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/preferences/quiet-hours', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setQuietHours(data);
        }
      } catch (error) {
        console.error('Failed to fetch quiet hours:', error);
      }
    };

    if (token) {
      fetchSettings();
      fetchAccount();
      fetchSessions();
      fetchLoginHistory();
      fetchQuietHours();
    }
    setLanguage(localStorage.getItem('language') || 'en');
    setMediaAutoplay(localStorage.getItem('mediaAutoplay') || 'always');
  }, [router]);

  const handleToggle = (field: keyof Settings) => {
    if (!settings) return;
    const updated = { ...settings, [field]: !settings[field] };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSelectChange = (field: string, value: string) => {
    if (!settings) return;
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    saveSettings(updated);
  };

  const saveSettings = async (data: Settings) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('New passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: passwordForm.current, new: passwordForm.new }),
      });
      if (response.ok) {
        setShowPasswordChange(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleEmailUpdate = async () => {
    if (!newEmail) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/users/email', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });
      if (response.ok) {
        const data = await response.json();
        setAccount({ ...account!, email: data.email });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Failed to update email');
      }
    } catch (error) {
      console.error('Failed to update email:', error);
    }
  };


  const handleToggle2FA = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/security/2fa', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: !account?.twoFactorEnabled }),
      });
      if (response.ok) {
        const data = await response.json();
        setAccount({ ...account!, twoFactorEnabled: data.twoFactorEnabled });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('Logout all devices?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/security/sessions', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setSessions([]);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to logout devices:', error);
    }
  };

  const handleQuietHoursUpdate = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/preferences/quiet-hours', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(quietHours),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to update quiet hours:', error);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleMediaAutoplayChange = (newAutoplay: string) => {
    setMediaAutoplay(newAutoplay);
    localStorage.setItem('mediaAutoplay', newAutoplay);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };


  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone. All your data will be permanently deleted.')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        localStorage.removeItem('auth_token');
        alert('Account deleted successfully');
        router.push('/auth/login');
      } else {
        alert('Failed to delete account. Report a problem at valueskinsfounder@gmail.com');
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Report a problem at valueskinsfounder@gmail.com');
    }
  };

  const handleGDPRExport = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/export-data', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-data.json';
        a.click();
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Logout from this device?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      localStorage.removeItem('auth_token');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('auth_token');
      router.push('/auth/login');
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (!token) {
    return (
      <div className="min-h-screen bg-surface text-on-surface">
        <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
          <div className="flex justify-between items-center px-6 h-20">
            <button onClick={() => router.push('/profile')} className="text-primary hover:text-primary-dim transition-colors">
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <span className="text-3xl font-black italic text-primary font-headline">Settings</span>
            <div className="w-10"></div>
          </div>
        </header>
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="text-6xl">⚙️</div>
            <h2 className="text-2xl font-headline font-bold">Sign in to customize settings</h2>
            <p className="text-on-surface-variant">Log in to manage your preferences, security, and notifications.</p>
            <button onClick={() => router.push('/auth/login')} className="btn-primary">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <button onClick={() => router.push('/profile')} className="text-primary hover:text-primary-dim transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <span className="text-3xl font-black italic text-primary font-headline">Settings</span>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <nav className="md:col-span-1">
            <div className="space-y-2 sticky top-24">
              {[
                { id: 'account', label: 'Account', icon: 'person' },
                { id: 'privacy', label: 'Privacy', icon: 'lock' },
                { id: 'notifications', label: 'Notifications', icon: 'notifications' },
                { id: 'security', label: 'Security', icon: 'security' },
                { id: 'content', label: 'Content & Feed', icon: 'tune' },
                { id: 'support', label: 'Support', icon: 'help' },
                { id: 'danger', label: 'Danger Zone', icon: 'warning' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary/20 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Account Section */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-headline font-bold">Account Settings</h2>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold">Edit Profile</h3>
                  <div className="text-sm text-on-surface-variant">
                    <p>Name: <span className="text-on-surface font-semibold">{account?.name}</span></p>
                    <p>Email: <span className="text-on-surface font-semibold">{account?.email}</span></p>
                  </div>
                  <button className="btn-secondary">Edit Profile</button>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold">Change Email</h3>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-surface-container-highest px-4 py-2 rounded border border-outline-variant/50"
                  />
                  <button onClick={handleEmailUpdate} className="btn-secondary">Update Email</button>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold">Change Password</h3>
                  <button onClick={() => setShowPasswordChange(!showPasswordChange)} className="btn-secondary">
                    {showPasswordChange ? 'Cancel' : 'Change Password'}
                  </button>
                  {showPasswordChange && (
                    <div className="space-y-3 pt-4 border-t border-outline-variant/20">
                      <input
                        type="password"
                        placeholder="Current password"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        className="w-full bg-surface-container-highest px-4 py-2 rounded border border-outline-variant/50"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        className="w-full bg-surface-container-highest px-4 py-2 rounded border border-outline-variant/50"
                      />
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        className="w-full bg-surface-container-highest px-4 py-2 rounded border border-outline-variant/50"
                      />
                      <button onClick={handlePasswordChange} className="btn-primary w-full">Update Password</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-headline font-bold">Privacy Settings</h2>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Profile Visibility</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Your profile and all posts are always PUBLIC on Nexus</p>
                  <div className="bg-primary/10 border border-primary/20 rounded px-4 py-3 text-sm">
                    <p className="font-semibold text-primary">✓ Always Public</p>
                    <p className="text-on-surface-variant text-xs mt-1">Your profile, posts, and content are visible to everyone.</p>
                  </div>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Who Can Message You?</h3>
                  <select
                    value={settings.allowMessages}
                    onChange={(e) => handleSelectChange('allowMessages', e.target.value)}
                    className="w-full bg-surface-container-highest px-4 py-2 rounded border border-outline-variant/50"
                  >
                    <option value="EVERYONE">Everyone</option>
                    <option value="FOLLOWERS_ONLY">Followers only</option>
                    <option value="NONE">No one</option>
                  </select>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Comments & Interactions</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Everyone can comment on your public posts</p>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-headline font-bold">Notification Settings</h2>

                <div className="card-surface p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-headline font-semibold">Push Notifications</p>
                      <p className="text-sm text-on-surface-variant">Likes, comments, follows, messages</p>
                    </div>
                    <button
                      onClick={() => handleToggle('pushNotifications')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        settings.pushNotifications ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.pushNotifications ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-headline font-semibold">Email Notifications</p>
                      <p className="text-sm text-on-surface-variant">Digest emails about activity</p>
                    </div>
                    <button
                      onClick={() => handleToggle('emailNotifications')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        settings.emailNotifications ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-headline font-semibold">In-App Notifications</p>
                      <p className="text-sm text-on-surface-variant">Show notifications in app</p>
                    </div>
                    <button
                      onClick={() => handleToggle('inAppNotifications')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        settings.inAppNotifications ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.inAppNotifications ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-headline font-semibold">Weekly Digest</p>
                      <p className="text-sm text-on-surface-variant">Weekly summary email</p>
                    </div>
                    <button
                      onClick={() => handleToggle('weeklyDigest')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        settings.weeklyDigest ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.weeklyDigest ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Do Not Disturb</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Set quiet hours for notifications</p>
                  <div className="flex gap-4">
                    <input
                      type="time"
                      value={quietHours.start}
                      onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                      className="flex-1 bg-surface-container-highest px-3 py-2 rounded border border-outline-variant/50"
                    />
                    <input
                      type="time"
                      value={quietHours.end}
                      onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                      className="flex-1 bg-surface-container-highest px-3 py-2 rounded border border-outline-variant/50"
                    />
                  </div>
                  <button onClick={handleQuietHoursUpdate} className="btn-secondary w-full">Save Quiet Hours</button>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-headline font-bold">Security Settings</h2>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Two-Factor Authentication</h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    {account?.twoFactorEnabled ? '✓ Enabled' : 'Disabled'}
                  </p>
                  <button onClick={handleToggle2FA} className="btn-secondary">
                    {account?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Active Sessions ({sessions.length})</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {sessions.length === 0 ? (
                      <p className="text-sm text-on-surface-variant">No active sessions</p>
                    ) : (
                      sessions.map(s => (
                        <div key={s.id} className="text-sm bg-surface-container-highest p-3 rounded">
                          <p className="font-semibold">{new Date(s.lastActivityAt).toLocaleString()}</p>
                          <p className="text-xs text-on-surface-variant">{s.ipAddress || 'Unknown IP'}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <button onClick={handleLogoutAllDevices} className="btn-secondary w-full mt-4">Logout All Devices</button>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Login History</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {loginHistory.length === 0 ? (
                      <p className="text-sm text-on-surface-variant text-center py-4">No login history</p>
                    ) : (
                      loginHistory.map((record, i) => (
                        <div key={i} className="text-sm bg-surface-container-highest p-3 rounded">
                          <p className="font-semibold">{new Date(record.timestamp).toLocaleString()}</p>
                          <p className="text-xs text-on-surface-variant">{record.device} • {record.ip}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Connected Apps</h3>
                  <div className="text-sm text-on-surface-variant text-center py-8">
                    No connected apps
                  </div>
                </div>
              </div>
            )}

            {/* Content & Feed Section */}
            {activeSection === 'content' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-headline font-bold">Content & Feed</h2>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Post Settings</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">Allow Comments on Your Posts</p>
                      <p className="text-sm text-on-surface-variant">Let others comment on your posts</p>
                    </div>
                    <button
                      onClick={() => handleToggle('allowComments')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        settings?.allowComments ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings?.allowComments ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Language</h3>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full bg-surface-container-highest px-4 py-2 rounded border border-outline-variant/50"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold mb-4">Media Autoplay</h3>
                  <select
                    value={mediaAutoplay}
                    onChange={(e) => handleMediaAutoplayChange(e.target.value)}
                    className="w-full bg-surface-container-highest px-4 py-2 rounded border border-outline-variant/50"
                  >
                    <option value="always">Always</option>
                    <option value="wifi">Wi-Fi only</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            )}

            {/* Support Section */}
            {activeSection === 'support' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-headline font-bold">Support & Help</h2>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold">Help Center</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Get answers to common questions</p>
                  <a href="#" className="btn-secondary inline-block">Open Help Center</a>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold">Report a Problem</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Let us know if something isn't working</p>
                  <button className="btn-secondary">Send Report</button>
                </div>

                <div className="card-surface p-6 space-y-4">
                  <h3 className="font-headline font-semibold">Legal</h3>
                  <div className="space-y-2 text-sm">
                    <p><a href="#" className="text-primary hover:underline">Privacy Policy</a></p>
                    <p><a href="#" className="text-primary hover:underline">Terms of Service</a></p>
                    <p><a href="#" className="text-primary hover:underline">Cookie Policy</a></p>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Section */}
            {activeSection === 'danger' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-headline font-bold text-red-500">Danger Zone</h2>

                <div className="card-surface p-6 space-y-4 border border-yellow-500/20 bg-yellow-500/5">
                  <h3 className="font-headline font-semibold text-yellow-500">Logout</h3>
                  <p className="text-sm text-on-surface-variant">Sign out from this device</p>
                  <button onClick={handleLogout} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100 px-4 py-2 rounded transition-colors">Logout</button>
                </div>

                <div className="card-surface p-6 space-y-4 border border-red-500/20 bg-red-500/5">
                  <h3 className="font-headline font-semibold text-red-500">Download My Data</h3>
                  <p className="text-sm text-on-surface-variant">Get a copy of all your data in a portable format (GDPR compliant)</p>
                  <button onClick={handleGDPRExport} className="btn-secondary">Export My Data</button>
                </div>

                <div className="card-surface p-6 space-y-4 border border-red-500/20 bg-red-500/5">
                  <h3 className="font-headline font-semibold text-red-500">Deactivate Account</h3>
                  <p className="text-sm text-on-surface-variant">Temporarily disable your account. You can reactivate it later.</p>
                  <button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-100 px-4 py-2 rounded transition-colors">Deactivate Account</button>
                </div>

                <div className="card-surface p-6 space-y-4 border border-red-500/20 bg-red-500/5">
                  <h3 className="font-headline font-semibold text-red-500">Delete Account</h3>
                  <p className="text-sm text-on-surface-variant">Permanently delete your account and all associated data. This cannot be undone.</p>
                  <button onClick={handleDeleteAccount} className="bg-red-500/20 hover:bg-red-500/30 text-red-100 px-4 py-2 rounded transition-colors">Delete Account</button>
                </div>
              </div>
            )}

            {/* Save Indicator */}
            {saved && (
              <div className="fixed bottom-4 right-4 bg-green-500/20 border border-green-500/50 rounded px-4 py-3 text-green-100">
                ✓ Settings saved successfully
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

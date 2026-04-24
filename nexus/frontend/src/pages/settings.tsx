'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Settings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  allowMessages: string;
  adultContent: boolean;
  weeklyDigest: boolean;
}

export default function Settings() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
    }

    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('auth_token');
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

    fetchSettings();
    setReady(true);
  }, [router]);

  const handleToggle = (field: keyof Settings) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: !settings[field],
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-primary">Loading...</div>
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
        <div className="max-w-2xl mx-auto px-4">
          {settings && (
            <div className="space-y-6">
              {/* Notifications Section */}
              <div className="card-surface p-6">
                <h2 className="text-xl font-headline font-bold mb-4">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-headline font-semibold">Email Notifications</p>
                      <p className="text-sm text-on-surface-variant">Receive updates via email</p>
                    </div>
                    <button
                      onClick={() => handleToggle('emailNotifications')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        settings.emailNotifications ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-headline font-semibold">Push Notifications</p>
                      <p className="text-sm text-on-surface-variant">Receive browser notifications</p>
                    </div>
                    <button
                      onClick={() => handleToggle('pushNotifications')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        settings.pushNotifications ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          settings.pushNotifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

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
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          settings.inAppNotifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-headline font-semibold">Weekly Digest</p>
                      <p className="text-sm text-on-surface-variant">Receive weekly summary email</p>
                    </div>
                    <button
                      onClick={() => handleToggle('weeklyDigest')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        settings.weeklyDigest ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          settings.weeklyDigest ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Section */}
              <div className="card-surface p-6">
                <h2 className="text-xl font-headline font-bold mb-4">Privacy</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-headline font-semibold mb-2">Who can message you?</label>
                    <select
                      value={settings.allowMessages}
                      onChange={(e) => handleSelectChange('allowMessages', e.target.value)}
                      className="w-full bg-surface-container-highest px-4 py-2 rounded-sm border border-outline-variant/50 focus:border-primary focus:ring-0"
                    >
                      <option value="EVERYONE">Everyone</option>
                      <option value="FOLLOWERS_ONLY">Followers only</option>
                      <option value="NONE">No one</option>
                    </select>
                  </div>
                  <p className="text-xs text-on-surface-variant">Note: Your profile and posts are always public</p>
                </div>
              </div>

              {/* Content Preferences Section */}
              <div className="card-surface p-6">
                <h2 className="text-xl font-headline font-bold mb-4">Content</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-headline font-semibold">Allow Adult Content</p>
                      <p className="text-sm text-on-surface-variant">Show content marked as adult</p>
                    </div>
                    <button
                      onClick={() => handleToggle('adultContent')}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        settings.adultContent ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          settings.adultContent ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-4">
                <button onClick={handleSave} className="btn-primary flex-1">
                  Save Settings
                </button>
              </div>

              {/* Success Message */}
              {saved && (
                <div className="bg-green-500/20 border border-green-500/50 rounded px-4 py-3 text-green-100">
                  Settings saved successfully
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

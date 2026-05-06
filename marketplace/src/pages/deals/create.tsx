'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateDeal() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');
  const [deliverables, setDeliverables] = useState(['']);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  const handleAddDeliverable = () => {
    setDeliverables([...deliverables, '']);
  };

  const handleDeliverableChange = (index: number, value: string) => {
    const updated = [...deliverables];
    updated[index] = value;
    setDeliverables(updated);
  };

  const handlePlatformToggle = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !budget || platforms.length === 0 || !deadline) {
      alert('Fill in all required fields');
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v1/deals', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          budget: Number(budget),
          platforms,
          deadline,
          deliverables: deliverables.filter(d => d.trim()),
        }),
      });

      if (response.ok) {
        const deal = await response.json();
        router.push(`/deals/${deal.id}`);
      } else {
        alert('Failed to create deal');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Error creating deal');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <h1 className="text-xl font-bold">Post a Campaign</h1>
          <button onClick={() => router.back()} className="text-sm text-outline">← Back</button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto pb-12">
        <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">Campaign Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 3 Instagram Reels for Product Launch"
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed brief: what you want, who should apply, style guide, etc."
                rows={5}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold mb-2">Budget (USD) *</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="2500"
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-semibold mb-3">Platforms *</label>
              <div className="flex flex-wrap gap-3">
                {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn'].map(p => (
                  <button
                    key={p}
                    onClick={() => handlePlatformToggle(p)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      platforms.includes(p)
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface border border-outline-variant text-on-surface'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold mb-2">Deadline *</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Deliverables */}
            <div>
              <label className="block text-sm font-semibold mb-3">Deliverables</label>
              <div className="space-y-2 mb-3">
                {deliverables.map((d, i) => (
                  <input
                    key={i}
                    type="text"
                    value={d}
                    onChange={(e) => handleDeliverableChange(i, e.target.value)}
                    placeholder="e.g., 3 Instagram Reels (30 sec max)"
                    className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                ))}
              </div>
              <button
                onClick={handleAddDeliverable}
                className="text-sm text-primary hover:text-primary/80 font-semibold"
              >
                + Add Deliverable
              </button>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-6 border-t border-outline-variant/20">
              <button
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-surface-container border border-outline-variant text-on-surface rounded-lg font-semibold hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating}
                className="flex-1 px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Post Campaign'}
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mt-8">
          <h3 className="font-semibold mb-3">How It Works</h3>
          <ul className="space-y-2 text-sm">
            <li>✓ Your budget is held in secure escrow</li>
            <li>✓ Creators can counter your terms</li>
            <li>✓ Contract auto-generates when both agree</li>
            <li>✓ Payments release on deliverable approval</li>
            <li>✓ Ratings help you find better creators next time</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Deal {
  id: string;
  brandName: string;
  brandAvatar: string;
  title: string;
  description: string;
  budget: number;
  platforms: string[];
  status: string;
  deadline: string;
  milestones: { title: string; pct: number; dueDate: string }[];
  deliverables: string[];
  creatorId?: string;
  creatorName?: string;
  messages: { id: string; user: string; text: string; timestamp: string }[];
}

export default function DealDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'deliverables' | 'contract' | 'payment'>('overview');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [contractSigned, setContractSigned] = useState(false);
  const [paymentMade, setPaymentMade] = useState(false);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchDeal = async () => {
      try {
        const response = await fetch(`/api/v1/deals/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDeal(data);
          setMessages(data.messages || []);
        }
      } catch (error) {
        // Demo deal
        const demoDeal = {
          id: '1',
          brandName: 'TechBrand Co',
          brandAvatar: 'T',
          title: '3 Instagram Reels for Q2 Product Launch',
          description: 'We need 3 high-energy Instagram reels showcasing our new productivity app. Should be 15-30 seconds, trending sounds, authentic reviews.',
          budget: 2500,
          platforms: ['Instagram'],
          status: 'PROPOSAL',
          deadline: '2026-06-15',
          milestones: [
            { title: 'Creative Brief Approval', pct: 0, dueDate: '2026-05-20' },
            { title: 'First Draft Submission', pct: 30, dueDate: '2026-06-01' },
            { title: 'Final Approved Content', pct: 100, dueDate: '2026-06-15' },
          ],
          deliverables: [
            'Reel 1: Product overview (30 sec max)',
            'Reel 2: User testimonial (30 sec max)',
            'Reel 3: Trending integration (30 sec max)',
          ],
          messages: [
            { id: '1', user: 'TechBrand Co', text: 'Hey! Love your recent work. We think you\'d be perfect for this campaign. The brief is in the deliverables section. Let us know if you have questions!', timestamp: '2026-05-10 10:30 AM' },
            { id: '2', user: 'You', text: 'Thanks for the opportunity! I\'ve reviewed the brief. Quick question - can we use trending audio like on the latest TikTok trends?', timestamp: '2026-05-10 2:15 PM' },
            { id: '3', user: 'TechBrand Co', text: 'Absolutely! As long as it fits the vibe. We want authentic, relatable content. The reels are for our Instagram Stories too.', timestamp: '2026-05-10 3:45 PM' },
          ],
        };
        setDeal(demoDeal);
        setMessages(demoDeal.messages || []);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [id, router]);

  const handleSendMessage = async () => {
    if (!message.trim() || !deal) return;

    const newMessage = {
      id: String(messages.length + 1),
      user: 'You',
      text: message,
      timestamp: new Date().toLocaleString(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/v1/deals/${deal.id}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) return <div className="min-h-screen bg-surface" />;
  if (!deal) return <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center">Deal not found</div>;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <h1 className="text-xl font-bold">{deal.title}</h1>
          <button onClick={() => router.back()} className="text-sm text-outline">← Back</button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-6xl mx-auto pb-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-outline-variant/20">
          {(['overview', 'chat', 'deliverables', 'contract', 'payment'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-outline'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Campaign Details</h2>
                <p className="text-outline mb-6">{deal.description}</p>

                <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-outline-variant/20">
                  <div>
                    <p className="text-sm text-outline mb-1">Budget</p>
                    <p className="text-2xl font-bold text-primary">${deal.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-outline mb-1">Deadline</p>
                    <p className="text-lg font-semibold">{deal.deadline}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Deliverables</h3>
                  <ul className="space-y-2">
                    {deal.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-on-surface">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Payment Milestones</h3>
                <div className="space-y-4">
                  {deal.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <p className="font-semibold">{m.title}</p>
                          <p className="text-primary font-bold">${Math.round(deal.budget * m.pct / 100)}</p>
                        </div>
                        <p className="text-xs text-outline">Due: {m.dueDate}</p>
                      </div>
                      {m.pct > 0 && <span className="text-success">✓ Escrowed</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 mb-6 sticky top-24">
                <div className="mb-6">
                  <p className="text-xs text-outline uppercase mb-2">Brand</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                      {deal.brandName[0]}
                    </div>
                    <p className="font-semibold">{deal.brandName}</p>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-outline-variant/20">
                  <p className="text-xs text-outline uppercase mb-2">Status</p>
                  <p className="px-3 py-1 bg-warning/20 text-warning rounded-full inline-block text-sm font-semibold">
                    {deal.status}
                  </p>
                </div>

                <div className="space-y-3">
                  <button onClick={() => setActiveTab('chat')} className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90">
                    Send Message
                  </button>
                  <button onClick={() => setActiveTab('contract')} className="w-full px-4 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10">
                    View Contract
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Deal Chat</h2>
            <div className="bg-surface rounded-lg p-4 h-96 overflow-y-auto mb-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.user === 'You' ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant'}`}>
                    <p className="text-xs opacity-75 mb-1">{msg.user} • {msg.timestamp}</p>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
              />
              <button onClick={handleSendMessage} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90">
                Send
              </button>
            </div>
          </div>
        )}

        {/* Deliverables Tab */}
        {activeTab === 'deliverables' && (
          <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Deliverables Tracking</h2>
            <div className="space-y-4">
              {deal.deliverables.map((d, i) => (
                <div key={i} className="border border-outline-variant/20 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold">{d}</p>
                    <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">Pending Submission</span>
                  </div>
                  <p className="text-sm text-outline mb-4">Due: {deal.milestones[i]?.dueDate}</p>
                  <input type="text" placeholder="Paste link to deliverable..." className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface text-sm focus:outline-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contract Tab */}
        {activeTab === 'contract' && (
          <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Smart Contract</h2>
            <div className="bg-surface rounded-lg p-4 mb-6 max-h-96 overflow-y-auto text-sm space-y-3">
              <p><strong>Brand:</strong> {deal.brandName}</p>
              <p><strong>Creator:</strong> {deal.creatorName || 'To be assigned'}</p>
              <p><strong>Scope:</strong> {deal.deliverables.join(', ')}</p>
              <p><strong>Budget:</strong> ${deal.budget}</p>
              <p><strong>Deadline:</strong> {deal.deadline}</p>
              <p className="border-t border-outline-variant pt-3"><strong>Payment Terms:</strong> 30% upfront, 70% on final delivery approval</p>
              <p><strong>Revision Policy:</strong> 2 rounds of revisions included</p>
            </div>
            {!contractSigned && (
              <button onClick={() => setContractSigned(true)} className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90">
                Sign Contract
              </button>
            )}
            {contractSigned && <p className="text-success text-sm">✓ Contract signed</p>}
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Escrow & Payment</h2>
            <div className="space-y-6">
              <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                <p className="text-success font-semibold mb-2">✓ Escrow Active</p>
                <p className="text-sm">Brand has funded ${deal.budget} into secure escrow</p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Payment Releases</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-surface rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">Milestone 1 (30%)</p>
                      <p className="text-xs text-outline">Due: {deal.milestones[1]?.dueDate}</p>
                    </div>
                    <p className="font-bold text-primary">${Math.round(deal.budget * 0.3)}</p>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-warning/50">
                    <div>
                      <p className="font-semibold text-sm">Milestone 2 (70%)</p>
                      <p className="text-xs text-outline">Due: {deal.deadline}</p>
                    </div>
                    <p className="font-bold">${Math.round(deal.budget * 0.7)}</p>
                  </div>
                </div>
              </div>

              {!paymentMade && contractSigned && (
                <button onClick={() => setPaymentMade(true)} className="w-full px-4 py-3 bg-success text-on-surface rounded-lg font-semibold hover:opacity-90">
                  Release First Milestone
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

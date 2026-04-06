'use client';

import { useMemo, useState } from 'react';

type Role = 'none' | 'creator' | 'brand';
type View = 'browse' | 'watch' | 'mim' | 'store';

type StreamCard = {
  id: string;
  title: string;
  creator: string;
  game: string;
  viewers: string;
  thumb: string;
};

const STREAMS: StreamCard[] = [
  {
    id: 's1',
    title: 'MEET AND GREET LIVE - NYC',
    creator: 'Mande',
    game: 'Just Chatting',
    viewers: '4.1K',
    thumb: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's2',
    title: 'RANKED GRIND ALL NIGHT',
    creator: 'eggsterr',
    game: 'VALORANT',
    viewers: '1.1K',
    thumb: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's3',
    title: 'TEAM FPS SCRIMS',
    creator: 'ESLCS',
    game: 'Counter-Strike',
    viewers: '285',
    thumb: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's4',
    title: 'JUST CHATTING + Q&A',
    creator: 'Lacy',
    game: 'Just Chatting',
    viewers: '15.2K',
    thumb: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's5',
    title: 'AIM TRAINING + VOD REVIEW',
    creator: 'TenZ',
    game: 'VALORANT',
    viewers: '6.8K',
    thumb: 'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's6',
    title: 'DUO CLUTCH CHALLENGE',
    creator: 'ion2x',
    game: 'VALORANT',
    viewers: '334',
    thumb: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1200&q=80',
  },
];

const CHANNELS = [
  { name: 'xQc', game: 'Minecraft', viewers: '23.1K' },
  { name: 'caseoh_', game: 'Retro Rewind', viewers: '56K' },
  { name: 'TBJZL', game: "I'm Only Sleeping", viewers: '681' },
  { name: 'TenZ', game: 'VALORANT', viewers: '6.8K' },
  { name: 'MarvelRivals', game: 'Marvel Rivals', viewers: '1.4K' },
  { name: 'CDAwg', game: 'Just Chatting', viewers: '24.4K' },
];

export default function TwitchDemoPage() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('browse');
  const [role, setRole] = useState<Role>('none');
  const [selected, setSelected] = useState(STREAMS[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STREAMS;
    return STREAMS.filter((s) => `${s.title} ${s.creator} ${s.game}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e10', color: '#efeff1' }}>
      <header style={{ height: 56, borderBottom: '1px solid #2f2f35', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: 4, background: '#9146ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>T</div>
        <div style={{ fontSize: 32, fontWeight: 700 }}>Browse</div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 'min(640px,100%)', display: 'flex' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              style={{ flex: 1, height: 40, background: '#18181b', color: '#efeff1', border: '1px solid #3a3a40', borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '0 12px', fontSize: 30, outline: 'none' }}
            />
            <button style={{ width: 48, border: '1px solid #3a3a40', background: '#2a2a31', color: '#fff', borderRadius: '0 8px 8px 0', fontSize: 22 }}>⌕</button>
          </div>
        </div>
        <button style={{ border: 'none', background: '#232329', color: '#efeff1', borderRadius: 999, padding: '8px 14px', fontWeight: 700, fontSize: 18 }}>Log In</button>
        <button style={{ border: 'none', background: '#9146ff', color: '#fff', borderRadius: 999, padding: '8px 14px', fontWeight: 700, fontSize: 18 }}>Sign Up</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr 390px', minHeight: 'calc(100vh - 56px)' }}>
        <aside style={{ borderRight: '1px solid #2f2f35', padding: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 8 }}>Live Channels</div>
          {CHANNELS.map((ch) => (
            <button key={ch.name} onClick={() => setView('watch')} style={{ width: '100%', background: 'transparent', border: 'none', color: '#efeff1', textAlign: 'left', padding: '8px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 34, fontWeight: 700 }}>{ch.name}</div>
                <div style={{ color: '#adadb8', fontSize: 32 }}>{ch.game}</div>
              </div>
              <div style={{ color: '#efeff1', fontSize: 30 }}>• {ch.viewers}</div>
            </button>
          ))}
          <div style={{ height: 1, background: '#2f2f35', margin: '10px 0' }} />
          <div style={{ fontWeight: 800, fontSize: 28, color: '#a970ff', marginBottom: 6 }}>ValueSkins</div>
          <button onClick={() => setView('mim')} style={railBtn(view === 'mim')}>Marketplace</button>
          <button onClick={() => setView('store')} style={railBtn(view === 'store')}>Store</button>
          <button onClick={() => { setView('mim'); setRole('creator'); }} style={railBtn(false)}>Login as Creator</button>
          <button onClick={() => { setView('mim'); setRole('brand'); }} style={railBtn(false)}>Login as Brand</button>
        </aside>

        <main style={{ padding: 10, overflow: 'auto' }}>
          {view === 'browse' && (
            <>
              <div style={{ fontSize: 46, fontWeight: 800, color: '#bf94ff', marginBottom: 10 }}>Recommended Streams</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
                {filtered.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelected(s); setView('watch'); }}
                    style={{ border: 'none', background: 'transparent', color: '#efeff1', textAlign: 'left', padding: 0, cursor: 'pointer' }}
                  >
                    <div style={{ position: 'relative', border: '3px solid #9146ff', borderRadius: 4, overflow: 'hidden' }}>
                      <img src={s.thumb} alt={s.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                      <span style={{ position: 'absolute', top: 8, left: 8, background: '#e91916', color: '#fff', borderRadius: 4, padding: '2px 6px', fontWeight: 800, fontSize: 20 }}>LIVE</span>
                      <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 30 }}>{s.viewers} viewers</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 36, fontWeight: 700, lineHeight: 1.2 }}>{s.title}</div>
                    <div style={{ color: '#adadb8', fontSize: 32 }}>{s.creator}</div>
                    <div style={{ color: '#adadb8', fontSize: 32 }}>{s.game}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {view === 'watch' && (
            <>
              <div style={{ border: '1px solid #2f2f35', borderRadius: 6, overflow: 'hidden' }}>
                <img src={selected.thumb} alt={selected.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ marginTop: 10, background: '#111116', border: '1px solid #2f2f35', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 40, fontWeight: 800 }}>{selected.title}</div>
                <div style={{ marginTop: 4, color: '#adadb8', fontSize: 32 }}>{selected.creator} · {selected.game} · {selected.viewers} viewers</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <button style={action('#9146ff')}>Follow</button>
                  <button style={action('#30303a')}>Gift a Sub</button>
                  <button style={action('#30303a')}>Subscribe</button>
                  <button onClick={() => setView('mim')} style={action('#1f3a64')}>ValueSkins Marketplace</button>
                  <button onClick={() => setView('store')} style={action('#3a2a52')}>ValueSkins Store</button>
                </div>
              </div>
            </>
          )}

          {view === 'mim' && (
            <div style={{ background: '#111116', border: '1px solid #2f2f35', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 44, fontWeight: 800, marginBottom: 10 }}>ValueSkins Marketplace</div>
              {role === 'none' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button onClick={() => setRole('creator')} style={roleCard()}>
                    <div style={{ fontSize: 34, fontWeight: 800 }}>Login as Creator</div>
                    <div style={{ color: '#adadb8', marginTop: 6, fontSize: 28 }}>See matched brand deals and paid collabs.</div>
                  </button>
                  <button onClick={() => setRole('brand')} style={roleCard()}>
                    <div style={{ fontSize: 34, fontWeight: 800 }}>Login as Brand</div>
                    <div style={{ color: '#adadb8', marginTop: 6, fontSize: 28 }}>Find streamers by game, audience, and trust.</div>
                  </button>
                </div>
              ) : role === 'creator' ? (
                <>
                  <div style={{ color: '#00d68f', marginBottom: 10, fontWeight: 700, fontSize: 30 }}>Creator mode active</div>
                  {['HyperX: 2 sponsored streams ($3,000)', 'Razer: Product showcase + highlights ($1,800)', 'Corsair: Live gear review + giveaway ($2,100)'].map((deal) => (
                    <div key={deal} style={{ background: '#1a1a22', border: '1px solid #2f2f35', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 30 }}>{deal}</div>
                  ))}
                </>
              ) : (
                <>
                  <div style={{ color: '#56ccf2', marginBottom: 10, fontWeight: 700, fontSize: 30 }}>Brand mode active</div>
                  {['TenZ (VALORANT) - 6.8K live viewers', 'CDAwg (Just Chatting) - 24.4K viewers', 'ion2x (VALORANT) - 334 viewers'].map((creator) => (
                    <div key={creator} style={{ background: '#1a1a22', border: '1px solid #2f2f35', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 30 }}>{creator}</div>
                  ))}
                </>
              )}
            </div>
          )}

          {view === 'store' && (
            <div style={{ background: '#111116', border: '1px solid #2f2f35', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 44, fontWeight: 800, marginBottom: 10 }}>ValueSkins Store</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
                {['FPS Pro', 'Chat Magnet', 'Brand Safe', 'Speedrunner', 'Esports Analyst', 'Community Builder'].map((skin) => (
                  <div key={skin} style={{ background: '#1a1a22', border: '1px solid #2f2f35', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 30 }}>{skin}</div>
                    <div style={{ color: '#adadb8', marginTop: 4, fontSize: 26 }}>Use this skin to unlock targeted deals.</div>
                    <button style={{ marginTop: 8, border: 'none', background: '#9146ff', color: '#fff', borderRadius: 6, padding: '8px 10px', fontWeight: 700, fontSize: 24 }}>Buy</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside style={{ borderLeft: '1px solid #2f2f35', padding: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 34, marginBottom: 10 }}>Stream Chat</div>
          <div style={{ background: '#111116', border: '1px solid #2f2f35', borderRadius: 8, padding: 10, minHeight: 420 }}>
            <div style={{ marginBottom: 8, fontSize: 30 }}><strong style={{ color: '#a970ff' }}>noukhii:</strong> Sens and setup posted above.</div>
            <div style={{ marginBottom: 8, fontSize: 30 }}><strong style={{ color: '#a970ff' }}>fpsfan_21:</strong> clutch incoming</div>
            <div style={{ marginBottom: 8, fontSize: 30 }}><strong style={{ color: '#a970ff' }}>brandwatch:</strong> this streamer has insane retention</div>
          </div>
          <input placeholder="Send a message" style={{ marginTop: 10, width: '100%', height: 44, background: '#18181b', color: '#efeff1', border: '1px solid #3a3a40', borderRadius: 8, padding: '0 10px', outline: 'none', fontSize: 28 }} />
        </aside>
      </div>
    </div>
  );
}

function railBtn(active: boolean): React.CSSProperties {
  return {
    width: '100%',
    textAlign: 'left',
    border: '1px solid #2f2f35',
    background: active ? '#2e1a52' : '#18181b',
    color: '#efeff1',
    borderRadius: 8,
    padding: '8px 10px',
    marginBottom: 8,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 24,
  };
}

function action(bg: string): React.CSSProperties {
  return {
    border: 'none',
    background: bg,
    color: '#fff',
    borderRadius: 999,
    padding: '8px 12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 24,
  };
}

function roleCard(): React.CSSProperties {
  return {
    background: '#1a1a22',
    border: '1px solid #2f2f35',
    borderRadius: 10,
    textAlign: 'left',
    color: '#efeff1',
    padding: 14,
    cursor: 'pointer',
  };
}

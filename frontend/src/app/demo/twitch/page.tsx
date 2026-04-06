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
  const [selected, setSelected] = useState<StreamCard>(STREAMS[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STREAMS;
    return STREAMS.filter((s) => `${s.title} ${s.creator} ${s.game}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="twitch-page">
      <header className="topbar">
        <div className="logo">T</div>
        <div className="browse">Browse</div>
        <div className="searchWrap">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="searchInput" />
          <button className="searchBtn">⌕</button>
        </div>
        <button className="ghost">Log In</button>
        <button className="primary">Sign Up</button>
      </header>

      <div className="layout">
        <aside className="leftRail">
          <div className="railTitle">Live Channels</div>
          {CHANNELS.map((ch) => (
            <button key={ch.name} onClick={() => setView('watch')} className="channelBtn">
              <div>
                <div className="channelName">{ch.name}</div>
                <div className="channelGame">{ch.game}</div>
              </div>
              <div className="channelViewers">• {ch.viewers}</div>
            </button>
          ))}

          <div className="divider" />
          <div className="valueSkinsTitle">ValueSkins</div>
          <button onClick={() => setView('mim')} className={`vsBtn ${view === 'mim' ? 'active' : ''}`}>Marketplace</button>
          <button onClick={() => setView('store')} className={`vsBtn ${view === 'store' ? 'active' : ''}`}>Store</button>
          <button onClick={() => { setView('mim'); setRole('creator'); }} className="vsBtn">Login as Creator</button>
          <button onClick={() => { setView('mim'); setRole('brand'); }} className="vsBtn">Login as Brand</button>
        </aside>

        <main className="content">
          {view === 'browse' && (
            <>
              <div className="sectionTitle">Recommended Streams</div>
              <div className="grid">
                {filtered.map((s) => (
                  <button key={s.id} onClick={() => { setSelected(s); setView('watch'); }} className="card">
                    <div className="thumbWrap">
                      <img src={s.thumb} alt={s.title} className="thumb" />
                      <span className="live">LIVE</span>
                      <span className="viewerBadge">{s.viewers} viewers</span>
                    </div>
                    <div className="cardTitle">{s.title}</div>
                    <div className="cardMeta">{s.creator}</div>
                    <div className="cardMeta">{s.game}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {view === 'watch' && (
            <>
              <div className="playerWrap">
                <img src={selected.thumb} alt={selected.title} className="player" />
              </div>
              <div className="watchInfo">
                <div className="watchTitle">{selected.title}</div>
                <div className="watchMeta">{selected.creator} · {selected.game} · {selected.viewers} viewers</div>
                <div className="watchActions">
                  <button className="pill purple">Follow</button>
                  <button className="pill dark">Gift a Sub</button>
                  <button className="pill dark">Subscribe</button>
                  <button onClick={() => setView('mim')} className="pill blue">ValueSkins Marketplace</button>
                  <button onClick={() => setView('store')} className="pill violet">ValueSkins Store</button>
                </div>
              </div>
            </>
          )}

          {view === 'mim' && (
            <div className="panel">
              <div className="panelTitle">ValueSkins Marketplace</div>
              {role === 'none' ? (
                <div className="roleGrid">
                  <button onClick={() => setRole('creator')} className="roleCard">
                    <div className="roleTitle">Login as Creator</div>
                    <div className="roleText">See matched brand deals and paid collabs.</div>
                  </button>
                  <button onClick={() => setRole('brand')} className="roleCard">
                    <div className="roleTitle">Login as Brand</div>
                    <div className="roleText">Find streamers by game, audience, and trust.</div>
                  </button>
                </div>
              ) : role === 'creator' ? (
                <>
                  <div className="statusGreen">Creator mode active</div>
                  {['HyperX: 2 sponsored streams ($3,000)', 'Razer: Product showcase + highlights ($1,800)', 'Corsair: Live gear review + giveaway ($2,100)'].map((deal) => (
                    <div key={deal} className="listItem">{deal}</div>
                  ))}
                </>
              ) : (
                <>
                  <div className="statusBlue">Brand mode active</div>
                  {['TenZ (VALORANT) - 6.8K live viewers', 'CDAwg (Just Chatting) - 24.4K viewers', 'ion2x (VALORANT) - 334 viewers'].map((creator) => (
                    <div key={creator} className="listItem">{creator}</div>
                  ))}
                </>
              )}
            </div>
          )}

          {view === 'store' && (
            <div className="panel">
              <div className="panelTitle">ValueSkins Store</div>
              <div className="storeGrid">
                {['FPS Pro', 'Chat Magnet', 'Brand Safe', 'Speedrunner', 'Esports Analyst', 'Community Builder'].map((skin) => (
                  <div key={skin} className="storeCard">
                    <div className="storeTitle">{skin}</div>
                    <div className="storeText">Use this skin to unlock targeted deals.</div>
                    <button className="buyBtn">Buy</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside className="rightRail">
          <div className="railTitle">Stream Chat</div>
          <div className="chatBox">
            <div className="chatMsg"><strong>noukhii:</strong> Sens and setup posted above.</div>
            <div className="chatMsg"><strong>fpsfan_21:</strong> clutch incoming</div>
            <div className="chatMsg"><strong>brandwatch:</strong> this streamer has insane retention</div>
          </div>
          <input placeholder="Send a message" className="chatInput" />
        </aside>
      </div>

      <style jsx>{`
        .twitch-page { min-height: 100vh; background: #0e0e10; color: #efeff1; }
        .topbar { height: 56px; border-bottom: 1px solid #2f2f35; display: flex; align-items: center; gap: 10px; padding: 0 10px; }
        .logo { width: 26px; height: 26px; border-radius: 4px; background: #9146ff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
        .browse { font-size: 22px; font-weight: 700; }
        .searchWrap { flex: 1; display: flex; justify-content: center; max-width: 620px; margin: 0 auto; }
        .searchInput { flex: 1; height: 38px; border: 1px solid #3a3a40; border-right: none; border-radius: 8px 0 0 8px; background: #18181b; color: #efeff1; padding: 0 12px; font-size: 14px; outline: none; }
        .searchBtn { width: 46px; border: 1px solid #3a3a40; border-radius: 0 8px 8px 0; background: #2a2a31; color: #fff; font-size: 15px; }
        .ghost, .primary { border: none; border-radius: 999px; padding: 8px 12px; font-size: 13px; font-weight: 700; cursor: pointer; }
        .ghost { background: #232329; color: #efeff1; }
        .primary { background: #9146ff; color: #fff; }

        .layout { display: grid; grid-template-columns: 260px 1fr 340px; min-height: calc(100vh - 56px); }
        .leftRail, .rightRail { padding: 10px; }
        .leftRail { border-right: 1px solid #2f2f35; }
        .rightRail { border-left: 1px solid #2f2f35; }
        .railTitle { font-size: 20px; font-weight: 800; margin-bottom: 8px; }

        .channelBtn { width: 100%; background: transparent; border: none; color: #efeff1; text-align: left; padding: 8px 0; cursor: pointer; display: flex; justify-content: space-between; gap: 8px; }
        .channelName { font-size: 16px; font-weight: 700; }
        .channelGame { font-size: 14px; color: #adadb8; }
        .channelViewers { font-size: 13px; color: #efeff1; white-space: nowrap; }

        .divider { height: 1px; background: #2f2f35; margin: 10px 0; }
        .valueSkinsTitle { font-size: 16px; font-weight: 800; color: #a970ff; margin-bottom: 6px; }
        .vsBtn { width: 100%; text-align: left; border: 1px solid #2f2f35; background: #18181b; color: #efeff1; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; cursor: pointer; font-weight: 700; font-size: 13px; }
        .vsBtn.active { background: #2e1a52; }

        .content { padding: 10px; overflow: auto; }
        .sectionTitle { font-size: 22px; font-weight: 800; color: #bf94ff; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .card { border: none; background: transparent; color: #efeff1; text-align: left; padding: 0; cursor: pointer; }
        .thumbWrap { position: relative; border: 2px solid #9146ff; border-radius: 4px; overflow: hidden; }
        .thumb { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
        .live { position: absolute; top: 8px; left: 8px; background: #e91916; color: #fff; border-radius: 4px; padding: 2px 6px; font-weight: 800; font-size: 11px; }
        .viewerBadge { position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.8); color: #fff; border-radius: 4px; padding: 2px 6px; font-size: 11px; }
        .cardTitle { margin-top: 8px; font-size: 16px; font-weight: 700; line-height: 1.3; }
        .cardMeta { font-size: 14px; color: #adadb8; }

        .playerWrap { border: 1px solid #2f2f35; border-radius: 6px; overflow: hidden; }
        .player { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
        .watchInfo { margin-top: 10px; background: #111116; border: 1px solid #2f2f35; border-radius: 8px; padding: 12px; }
        .watchTitle { font-size: 22px; font-weight: 800; }
        .watchMeta { margin-top: 4px; color: #adadb8; font-size: 14px; }
        .watchActions { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
        .pill { border: none; color: #fff; border-radius: 999px; padding: 8px 12px; font-weight: 700; cursor: pointer; font-size: 13px; }
        .pill.purple { background: #9146ff; }
        .pill.dark { background: #30303a; }
        .pill.blue { background: #1f3a64; }
        .pill.violet { background: #3a2a52; }

        .panel { background: #111116; border: 1px solid #2f2f35; border-radius: 10px; padding: 16px; }
        .panelTitle { font-size: 24px; font-weight: 800; margin-bottom: 10px; }
        .roleGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .roleCard { background: #1a1a22; border: 1px solid #2f2f35; border-radius: 10px; text-align: left; color: #efeff1; padding: 14px; cursor: pointer; }
        .roleTitle { font-size: 18px; font-weight: 800; }
        .roleText { color: #adadb8; margin-top: 6px; font-size: 14px; }
        .statusGreen { color: #00d68f; margin-bottom: 10px; font-weight: 700; font-size: 15px; }
        .statusBlue { color: #56ccf2; margin-bottom: 10px; font-weight: 700; font-size: 15px; }
        .listItem { background: #1a1a22; border: 1px solid #2f2f35; border-radius: 8px; padding: 12px; margin-bottom: 8px; font-size: 14px; }

        .storeGrid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; }
        .storeCard { background: #1a1a22; border: 1px solid #2f2f35; border-radius: 8px; padding: 12px; }
        .storeTitle { font-weight: 700; font-size: 16px; }
        .storeText { color: #adadb8; margin-top: 4px; font-size: 13px; }
        .buyBtn { margin-top: 8px; border: none; background: #9146ff; color: #fff; border-radius: 6px; padding: 8px 10px; font-weight: 700; font-size: 13px; }

        .chatBox { background: #111116; border: 1px solid #2f2f35; border-radius: 8px; padding: 10px; min-height: 360px; }
        .chatMsg { margin-bottom: 8px; font-size: 14px; }
        .chatMsg strong { color: #a970ff; }
        .chatInput { margin-top: 10px; width: 100%; height: 40px; background: #18181b; color: #efeff1; border: 1px solid #3a3a40; border-radius: 8px; padding: 0 10px; outline: none; font-size: 14px; }

        @media (max-width: 1200px) {
          .layout { grid-template-columns: 220px 1fr; }
          .rightRail { display: none; }
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .storeGrid { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }

        @media (max-width: 860px) {
          .layout { grid-template-columns: 1fr; }
          .leftRail { display: none; }
          .topbar { gap: 8px; }
          .browse { font-size: 18px; }
          .searchWrap { max-width: none; }
          .ghost, .primary { font-size: 12px; padding: 7px 10px; }
          .grid, .storeGrid, .roleGrid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

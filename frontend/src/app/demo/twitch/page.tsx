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
  category: string;
  thumb: string;
};

const STREAMS: StreamCard[] = [
  {
    id: 's1',
    title: 'MEET AND GREET LIVE - NYC',
    creator: 'Mande',
    game: 'Just Chatting',
    viewers: '4.1K',
    category: 'IRL',
    thumb: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's2',
    title: 'RANKED GRIND ALL NIGHT',
    creator: 'eggsterr',
    game: 'VALORANT',
    viewers: '1.1K',
    category: 'Competitive',
    thumb: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's3',
    title: 'TEAM FPS SCRIMS',
    creator: 'ESLCS',
    game: 'Counter-Strike',
    viewers: '285',
    category: 'Esports',
    thumb: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's4',
    title: 'JUST CHATTING + Q&A',
    creator: 'Lacy',
    game: 'Just Chatting',
    viewers: '15.2K',
    category: 'Community',
    thumb: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's5',
    title: 'AIM TRAINING + VOD REVIEW',
    creator: 'TenZ',
    game: 'VALORANT',
    viewers: '6.8K',
    category: 'FPS',
    thumb: 'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's6',
    title: 'DUO CLUTCH CHALLENGE',
    creator: 'ion2x',
    game: 'VALORANT',
    viewers: '334',
    category: 'Challenge',
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

const MARKETPLACE_DEALS = [
  'HyperX: 2 sponsored streams + clip package ($3,000)',
  'Razer: Gear showcase with pinned command CTA ($1,800)',
  'Corsair: Live gear review + giveaway activation ($2,100)',
];

const BRAND_MATCHES = [
  'TenZ · VALORANT · 6.8K live viewers · Trust tier A',
  'CDAwg · Just Chatting · 24.4K viewers · Brand safe',
  'ion2x · VALORANT · 334 viewers · High chat conversion',
];

const STORE_SKINS = [
  'FPS Pro',
  'Chat Magnet',
  'Brand Safe',
  'Speedrunner',
  'Esports Analyst',
  'Community Builder',
];

const CHAT_MESSAGES = [
  { user: 'noukhii', text: 'Sens and setup posted above.' },
  { user: 'fpsfan_21', text: 'clutch incoming' },
  { user: 'brandwatch', text: 'this streamer has insane retention' },
  { user: 'mod_mira', text: 'drop your favorite loadout in chat' },
];

export default function TwitchDemoPage() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('browse');
  const [role, setRole] = useState<Role>('none');
  const [selected, setSelected] = useState<StreamCard>(STREAMS[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STREAMS;
    return STREAMS.filter((stream) =>
      `${stream.title} ${stream.creator} ${stream.game} ${stream.category}`.toLowerCase().includes(q)
    );
  }, [query]);

  const openStream = (stream: StreamCard) => {
    setSelected(stream);
    setView('watch');
  };

  return (
    <div className="twitchPage">
      <header className="topbar">
        <div className="topbarLeft">
          <button type="button" className="logo" onClick={() => setView('browse')} aria-label="Open home">
            <span>glitch</span>
          </button>
          <button type="button" className="navLink" onClick={() => setView('browse')}>
            Following
          </button>
          <button type="button" className="navLink" onClick={() => setView('browse')}>
            Browse
          </button>
        </div>

        <div className="searchWrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels, categories, or streamers"
            className="searchInput"
          />
          <button type="button" className="searchBtn" aria-label="Search">
            Search
          </button>
        </div>

        <div className="topbarRight">
          <button type="button" className="ghostBtn">
            Log In
          </button>
          <button type="button" className="primaryBtn">
            Sign Up
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebarSection">
            <div className="sectionHeader">Followed Channels</div>
            {CHANNELS.map((channel) => (
              <button
                key={channel.name}
                type="button"
                onClick={() => {
                  const matchingStream = STREAMS.find((stream) => stream.creator.toLowerCase() === channel.name.toLowerCase());
                  if (matchingStream) {
                    openStream(matchingStream);
                    return;
                  }
                  setView('watch');
                }}
                className="channelBtn"
              >
                <div className="channelIdentity">
                  <div className="channelAvatar">{channel.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="channelName">{channel.name}</div>
                    <div className="channelGame">{channel.game}</div>
                  </div>
                </div>
                <div className="channelStats">
                  <span className="liveDot" />
                  {channel.viewers}
                </div>
              </button>
            ))}
          </div>

          <div className="sidebarSection">
            <div className="sectionHeader accent">ValueSkins on Twitch</div>
            <button type="button" onClick={() => setView('mim')} className={`sidebarAction ${view === 'mim' ? 'active' : ''}`}>
              Marketplace
            </button>
            <button type="button" onClick={() => setView('store')} className={`sidebarAction ${view === 'store' ? 'active' : ''}`}>
              Store
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('creator');
                setView('mim');
              }}
              className="sidebarAction"
            >
              Streamer view
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('brand');
                setView('mim');
              }}
              className="sidebarAction"
            >
              Sponsor view
            </button>
          </div>
        </aside>

        <main className="mainContent">
          <div className="hero">
            <div>
              <div className="eyebrow">Live channel growth for Twitch</div>
              <h1 className="heroTitle">A Twitch-style layout with ValueSkins folded in naturally.</h1>
              <p className="heroText">
                Streamers get discovery, sponsor trust, and channel-level signals without breaking the native Twitch feel.
              </p>
            </div>
            <div className="heroStats">
              <div className="heroStat">
                <strong>2 sides</strong>
                <span>Streamers and sponsors</span>
              </div>
              <div className="heroStat">
                <strong>6 live demos</strong>
                <span>Browse, watch, marketplace, store</span>
              </div>
            </div>
          </div>

          <div className="contentTabs">
            <button type="button" className={`tab ${view === 'browse' ? 'active' : ''}`} onClick={() => setView('browse')}>
              Home
            </button>
            <button type="button" className={`tab ${view === 'watch' ? 'active' : ''}`} onClick={() => setView('watch')}>
              Watch
            </button>
            <button type="button" className={`tab ${view === 'mim' ? 'active' : ''}`} onClick={() => setView('mim')}>
              Marketplace
            </button>
            <button type="button" className={`tab ${view === 'store' ? 'active' : ''}`} onClick={() => setView('store')}>
              Store
            </button>
          </div>

          {view === 'browse' && (
            <section className="pageSection">
              <div className="sectionTitleRow">
                <div>
                  <div className="sectionTitle">Recommended live channels</div>
                  <div className="sectionSubtext">Clean cards, readable metadata, and the normal Twitch browse rhythm.</div>
                </div>
                <div className="resultsBadge">{filtered.length} live now</div>
              </div>

              <div className="streamGrid">
                {filtered.map((stream) => (
                  <button key={stream.id} type="button" onClick={() => openStream(stream)} className="streamCard">
                    <div className="streamThumbWrap">
                      <img src={stream.thumb} alt={stream.title} className="streamThumb" />
                      <span className="liveBadge">LIVE</span>
                      <span className="viewerBadge">{stream.viewers} viewers</span>
                    </div>
                    <div className="streamMeta">
                      <div className="streamAvatar">{stream.creator.slice(0, 2).toUpperCase()}</div>
                      <div className="streamText">
                        <div className="streamTitle">{stream.title}</div>
                        <div className="streamCreator">{stream.creator}</div>
                        <div className="streamGame">
                          {stream.game} · {stream.category}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {view === 'watch' && (
            <section className="watchLayout">
              <div className="watchMain">
                <div className="playerCard">
                  <img src={selected.thumb} alt={selected.title} className="player" />
                </div>

                <div className="watchInfo">
                  <div className="watchHeadingRow">
                    <div>
                      <div className="watchTitle">{selected.title}</div>
                      <div className="watchMeta">
                        {selected.creator} · {selected.game} · {selected.viewers} viewers
                      </div>
                    </div>
                    <div className="watchButtons">
                      <button type="button" className="pill primaryPill">
                        Follow
                      </button>
                      <button type="button" className="pill mutedPill">
                        Subscribe
                      </button>
                      <button type="button" className="pill mutedPill">
                        Gift a Sub
                      </button>
                    </div>
                  </div>

                  <div className="featureStrip">
                    <button type="button" onClick={() => setView('mim')} className="featureCard">
                      <span>ValueSkins Network</span>
                      <strong>Open sponsor activations</strong>
                    </button>
                    <button type="button" onClick={() => setView('store')} className="featureCard">
                      <span>ValueSkins Loadout</span>
                      <strong>Turn on channel trust signals</strong>
                    </button>
                  </div>
                </div>
              </div>

              <aside className="chatRail">
                <div className="chatCard">
                  <div className="chatHeader">
                    <div>Stream Chat</div>
                    <span>{selected.viewers} here</span>
                  </div>
                  <div className="chatMessages">
                    {CHAT_MESSAGES.map((message) => (
                      <div key={`${message.user}-${message.text}`} className="chatMsg">
                        <strong>{message.user}</strong> {message.text}
                      </div>
                    ))}
                  </div>
                  <input placeholder="Send a message" className="chatInput" />
                </div>
              </aside>
            </section>
          )}

          {view === 'mim' && (
            <section className="pageSection">
              <div className="sectionTitle">ValueSkins Network</div>
              <div className="marketIntro">
                On Twitch, the two sides are streamers and sponsors, including brands, publishers, and event partners.
              </div>

              {role === 'none' ? (
                <div className="roleGrid">
                  <button type="button" onClick={() => setRole('creator')} className="roleCard">
                    <span className="roleBadge">Streamer</span>
                    <div className="roleTitle">See inbound activations</div>
                    <div className="roleText">Streamers review paid stream integrations, audience fit, and trust signals.</div>
                  </button>
                  <button type="button" onClick={() => setRole('brand')} className="roleCard">
                    <span className="roleBadge alt">Sponsor</span>
                    <div className="roleTitle">Find channels with real traction</div>
                    <div className="roleText">Sponsors find trusted streamers by game, category, and chat retention.</div>
                  </button>
                </div>
              ) : role === 'creator' ? (
                <div className="panel">
                  <div className="statusLabel creator">Streamer mode active</div>
                  {MARKETPLACE_DEALS.map((deal) => (
                    <div key={deal} className="listItem">
                      {deal}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="panel">
                  <div className="statusLabel brand">Sponsor mode active</div>
                  {BRAND_MATCHES.map((creator) => (
                    <div key={creator} className="listItem">
                      {creator}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {view === 'store' && (
            <section className="pageSection">
              <div className="sectionTitle">ValueSkins Loadout</div>
              <div className="sectionSubtext">Channel badges streamers can turn on to signal niche, trust, and sponsor readiness.</div>
              <div className="storeGrid">
                {STORE_SKINS.map((skin) => (
                  <div key={skin} className="storeCard">
                    <div className="storeTop">
                      <span className="storeTag">Channel Badge</span>
                      <span className="storePrice">$29</span>
                    </div>
                    <div className="storeTitle">{skin}</div>
                    <div className="storeText">Use this badge to unlock more targeted matches and stronger sponsor positioning.</div>
                    <button type="button" className="buyBtn">
                      Buy now
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <style jsx>{`
        .twitchPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top, rgba(145, 70, 255, 0.18), transparent 34%),
            #0e0e10;
          color: #efeff1;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: grid;
          grid-template-columns: auto minmax(280px, 560px) auto;
          align-items: center;
          gap: 16px;
          padding: 12px 20px;
          border-bottom: 1px solid #232328;
          background: rgba(24, 24, 27, 0.92);
          backdrop-filter: blur(14px);
        }

        .topbarLeft,
        .topbarRight {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          padding: 0 12px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #9146ff, #772ce8);
          color: #ffffff;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
        }

        .navLink,
        .ghostBtn,
        .primaryBtn,
        .searchBtn {
          border: 0;
          cursor: pointer;
          font-weight: 700;
        }

        .navLink {
          background: transparent;
          color: #efeff1;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
        }

        .navLink:hover,
        .sidebarAction:hover,
        .tab:hover {
          background: #232329;
        }

        .searchWrap {
          display: grid;
          grid-template-columns: 1fr auto;
          width: 100%;
        }

        .searchInput {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          border: 1px solid #31313a;
          border-right: 0;
          border-radius: 12px 0 0 12px;
          background: #18181b;
          color: #efeff1;
          outline: none;
          font-size: 14px;
        }

        .searchBtn {
          height: 42px;
          padding: 0 16px;
          border-radius: 0 12px 12px 0;
          background: #2c2c35;
          color: #efeff1;
          font-size: 13px;
        }

        .ghostBtn,
        .primaryBtn {
          height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          font-size: 13px;
        }

        .ghostBtn {
          background: #232329;
          color: #efeff1;
        }

        .primaryBtn {
          background: #9146ff;
          color: #ffffff;
        }

        .layout {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          min-height: calc(100vh - 65px);
        }

        .sidebar {
          border-right: 1px solid #232328;
          background: #111114;
          padding: 18px 14px;
        }

        .sidebarSection + .sidebarSection {
          margin-top: 22px;
          padding-top: 22px;
          border-top: 1px solid #232328;
        }

        .sectionHeader {
          margin-bottom: 12px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #adadb8;
        }

        .sectionHeader.accent {
          color: #bf94ff;
        }

        .channelBtn,
        .sidebarAction,
        .streamCard,
        .roleCard,
        .featureCard {
          width: 100%;
          border: 0;
          cursor: pointer;
        }

        .channelBtn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 8px;
          border-radius: 12px;
          background: transparent;
          color: #efeff1;
          text-align: left;
        }

        .channelBtn:hover,
        .streamCard:hover,
        .roleCard:hover,
        .featureCard:hover {
          background: #19191d;
        }

        .channelIdentity {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .channelAvatar,
        .streamAvatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(145, 70, 255, 0.9), rgba(50, 115, 220, 0.7));
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .channelName,
        .streamCreator {
          font-size: 14px;
          font-weight: 700;
        }

        .channelGame,
        .streamGame,
        .sectionSubtext,
        .roleText,
        .storeText,
        .watchMeta,
        .heroText,
        .marketIntro {
          color: #adadb8;
          font-size: 14px;
          line-height: 1.5;
        }

        .channelStats {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #dedee3;
          font-size: 13px;
          white-space: nowrap;
        }

        .liveDot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #eb0400;
        }

        .sidebarAction {
          display: flex;
          align-items: center;
          min-height: 42px;
          padding: 0 12px;
          border-radius: 12px;
          background: #18181b;
          color: #efeff1;
          text-align: left;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .sidebarAction.active {
          background: rgba(145, 70, 255, 0.18);
          color: #ffffff;
          box-shadow: inset 0 0 0 1px rgba(145, 70, 255, 0.45);
        }

        .mainContent {
          padding: 24px;
        }

        .hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          padding: 24px;
          border: 1px solid #232328;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(145, 70, 255, 0.18), rgba(20, 20, 24, 0.94));
          margin-bottom: 20px;
        }

        .eyebrow {
          margin-bottom: 10px;
          color: #bf94ff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .heroTitle {
          margin: 0;
          max-width: 720px;
          font-size: 34px;
          line-height: 1.08;
          font-weight: 800;
        }

        .heroText {
          max-width: 720px;
          margin-top: 12px;
          margin-bottom: 0;
        }

        .heroStats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          min-width: 300px;
        }

        .heroStat {
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          background: rgba(10, 10, 12, 0.42);
        }

        .heroStat strong,
        .storePrice,
        .watchTitle,
        .sectionTitle,
        .panel,
        .roleTitle {
          color: #ffffff;
        }

        .heroStat strong {
          display: block;
          margin-bottom: 6px;
          font-size: 18px;
        }

        .heroStat span {
          color: #c7c7d1;
          font-size: 13px;
          line-height: 1.4;
        }

        .contentTabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          overflow-x: auto;
        }

        .tab {
          border: 0;
          border-radius: 999px;
          background: #18181b;
          color: #efeff1;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .tab.active {
          background: #9146ff;
        }

        .pageSection {
          padding: 22px;
          border: 1px solid #232328;
          border-radius: 20px;
          background: #111114;
        }

        .sectionTitleRow {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .sectionTitle {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .resultsBadge {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(145, 70, 255, 0.12);
          color: #cdaeff;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .streamGrid,
        .storeGrid,
        .roleGrid {
          display: grid;
          gap: 16px;
        }

        .streamGrid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .streamCard {
          padding: 0;
          background: transparent;
          color: #efeff1;
          text-align: left;
          border-radius: 18px;
          overflow: hidden;
        }

        .streamThumbWrap,
        .playerCard {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid #2d2d35;
          background: #0b0b0d;
        }

        .streamThumb,
        .player {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
        }

        .liveBadge,
        .viewerBadge,
        .storeTag,
        .roleBadge,
        .statusLabel {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .liveBadge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 5px 8px;
          border-radius: 8px;
          background: #eb0400;
          color: #ffffff;
          font-size: 11px;
        }

        .viewerBadge {
          position: absolute;
          left: 12px;
          bottom: 12px;
          padding: 5px 8px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: #ffffff;
          font-size: 12px;
        }

        .streamMeta {
          display: flex;
          gap: 12px;
          padding: 12px 4px 4px;
        }

        .streamText {
          min-width: 0;
        }

        .streamTitle,
        .watchTitle {
          font-weight: 800;
          line-height: 1.35;
        }

        .streamTitle {
          margin-bottom: 4px;
          font-size: 16px;
        }

        .watchLayout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 18px;
        }

        .watchMain,
        .chatRail {
          min-width: 0;
        }

        .watchInfo,
        .chatCard,
        .panel {
          margin-top: 16px;
          padding: 18px;
          border: 1px solid #232328;
          border-radius: 18px;
          background: #111114;
        }

        .watchHeadingRow {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .watchTitle {
          font-size: 26px;
        }

        .watchButtons,
        .featureStrip {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .featureStrip {
          margin-top: 18px;
        }

        .pill {
          min-height: 40px;
          padding: 0 14px;
          border: 0;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          color: #ffffff;
        }

        .primaryPill {
          background: #9146ff;
        }

        .mutedPill {
          background: #2b2b33;
        }

        .featureCard {
          flex: 1;
          min-width: 220px;
          padding: 16px;
          border-radius: 16px;
          background: #18181b;
          color: #efeff1;
          text-align: left;
        }

        .featureCard span {
          display: block;
          color: #adadb8;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .featureCard strong {
          font-size: 16px;
          line-height: 1.35;
        }

        .chatCard {
          margin-top: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .chatHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .chatHeader span {
          color: #adadb8;
          font-size: 12px;
          font-weight: 700;
        }

        .chatMessages {
          flex: 1;
          min-height: 320px;
          border-radius: 14px;
          background: #18181b;
          border: 1px solid #232328;
          padding: 14px;
        }

        .chatMsg {
          margin-bottom: 10px;
          font-size: 14px;
          line-height: 1.5;
        }

        .chatMsg strong {
          color: #bf94ff;
        }

        .chatInput {
          width: 100%;
          height: 42px;
          margin-top: 12px;
          padding: 0 12px;
          border: 1px solid #31313a;
          border-radius: 12px;
          background: #18181b;
          color: #efeff1;
          outline: none;
          font-size: 14px;
        }

        .marketIntro {
          margin-bottom: 18px;
        }

        .roleGrid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .roleCard {
          padding: 20px;
          border-radius: 18px;
          background: #18181b;
          color: #efeff1;
          text-align: left;
        }

        .roleBadge,
        .storeTag,
        .statusLabel {
          width: fit-content;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          text-transform: uppercase;
        }

        .roleBadge {
          margin-bottom: 14px;
          background: rgba(145, 70, 255, 0.16);
          color: #d3b7ff;
        }

        .roleBadge.alt {
          background: rgba(61, 153, 245, 0.16);
          color: #a9d7ff;
        }

        .roleTitle {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .statusLabel {
          margin-bottom: 16px;
        }

        .statusLabel.creator {
          background: rgba(0, 214, 143, 0.16);
          color: #82f0c2;
        }

        .statusLabel.brand {
          background: rgba(86, 204, 242, 0.16);
          color: #9de6fb;
        }

        .listItem {
          padding: 14px 16px;
          border: 1px solid #232328;
          border-radius: 14px;
          background: #18181b;
          color: #efeff1;
          font-size: 14px;
        }

        .listItem + .listItem {
          margin-top: 10px;
        }

        .storeGrid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin-top: 18px;
        }

        .storeCard {
          padding: 18px;
          border: 1px solid #232328;
          border-radius: 18px;
          background: #18181b;
        }

        .storeTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }

        .storeTag {
          background: rgba(145, 70, 255, 0.16);
          color: #d3b7ff;
        }

        .storePrice {
          font-size: 15px;
          font-weight: 800;
        }

        .storeTitle {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .buyBtn {
          height: 42px;
          margin-top: 18px;
          padding: 0 14px;
          border: 0;
          border-radius: 12px;
          background: #9146ff;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 1200px) {
          .streamGrid,
          .storeGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .watchLayout {
            grid-template-columns: 1fr;
          }

          .chatMessages {
            min-height: 220px;
          }
        }

        @media (max-width: 980px) {
          .topbar {
            grid-template-columns: 1fr;
          }

          .layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            border-right: 0;
            border-bottom: 1px solid #232328;
          }

          .hero {
            flex-direction: column;
            align-items: stretch;
          }

          .heroStats,
          .roleGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .mainContent,
          .sidebar {
            padding: 16px;
          }

          .pageSection,
          .hero {
            padding: 18px;
            border-radius: 18px;
          }

          .heroTitle {
            font-size: 28px;
          }

          .sectionTitleRow,
          .watchHeadingRow {
            flex-direction: column;
            align-items: flex-start;
          }

          .streamGrid,
          .storeGrid {
            grid-template-columns: 1fr;
          }

          .topbarLeft,
          .topbarRight {
            flex-wrap: wrap;
          }

          .searchWrap {
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}

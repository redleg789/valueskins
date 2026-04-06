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
  tag: string;
  thumb: string;
};

const STREAMS: StreamCard[] = [
  {
    id: 's1',
    title: "Where's my good boys... Goddess ASMR",
    creator: 'Castaway',
    game: 'Just Chatting',
    viewers: '343',
    tag: 'girl',
    thumb: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's2',
    title: 'MEET AND GREET AT Tipsy Dreamer 1-4PM',
    creator: 'Mande',
    game: 'Just Chatting',
    viewers: '4.1K',
    tag: 'English',
    thumb: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's3',
    title: 'EXPLORING HAUNTED FOREST W/ @Rosiiwu',
    creator: 'Arky',
    game: 'Just Chatting',
    viewers: '6.9K',
    tag: 'English',
    thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's4',
    title: 'WINNING GAMES TONIGHT SUPER LOCKED IN',
    creator: 'Hamy',
    game: 'VALORANT',
    viewers: '242',
    tag: 'English',
    thumb: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's5',
    title: 'WHY AM I the GOAT',
    creator: 'eggsterr',
    game: 'VALORANT',
    viewers: '1.1K',
    tag: 'English',
    thumb: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 's6',
    title: 'RERUN: NAVI vs. G2 - ESL Pro League Season 23',
    creator: 'ESLCS',
    game: 'Counter-Strike',
    viewers: '285',
    tag: 'English',
    thumb: 'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1200&q=80',
  },
];

const FEATURED_IDS = ['s1', 's2', 's3'];
const FPS_IDS = ['s4', 's5', 's6'];

const CHANNELS = [
  { name: 'xQc', game: 'Minecraft', viewers: '23.1K' },
  { name: 'caseoh_', game: 'Retro Rewind: Vid...', viewers: '56K' },
  { name: 'TBJZL', game: "I'm Only Sleeping", viewers: '681' },
  { name: 'ESL_DOTA2', game: 'Dota 2', viewers: '167' },
  { name: 'Lacy', game: 'Grand Theft Aut...', viewers: '15.2K' },
  { name: 'TenZ', game: 'VALORANT', viewers: '6.7K' },
  { name: 'Faith', game: 'Just Chatting', viewers: '325' },
  { name: 'MarvelRivals', game: 'Marvel Rivals', viewers: '1.4K' },
  { name: 'ion2x', game: 'VALORANT', viewers: '334' },
  { name: 'CDAwg', game: 'Just Chatting', viewers: '24.4K' },
];

const MARKETPLACE_DEALS = [
  'HyperX: Sponsored live session + clipped highlight package ($3,000)',
  'Razer: Gear showcase with chat command CTA ($1,800)',
  'Corsair: Giveaway activation + stream overlay slot ($2,100)',
];

const BRAND_MATCHES = [
  'Mande · Just Chatting · 4.1K live viewers · High event turnout',
  'Arky · Just Chatting · 6.9K viewers · Strong session length',
  'eggsterr · VALORANT · 1.1K viewers · High FPS affinity',
];

const LOADOUT_ITEMS = [
  'FPS Pro',
  'Chat Magnet',
  'Brand Safe',
  'Speedrunner',
  'Esports Analyst',
  'Community Builder',
];

const CHAT_MESSAGES = [
  { user: 'noukhii', text: 'sens and setup posted above' },
  { user: 'fpsfan_21', text: 'clutch incoming' },
  { user: 'brandwatch', text: 'retention is crazy on this channel' },
  { user: 'mod_mira', text: 'drop your favorite loadout in chat' },
];

export default function TwitchDemoPage() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('browse');
  const [role, setRole] = useState<Role>('none');
  const [selected, setSelected] = useState<StreamCard>(STREAMS[1]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STREAMS;
    return STREAMS.filter((stream) =>
      `${stream.title} ${stream.creator} ${stream.game} ${stream.tag}`.toLowerCase().includes(q)
    );
  }, [query]);

  const featuredStreams = (query ? filtered : STREAMS).filter((stream) => FEATURED_IDS.includes(stream.id));
  const fpsStreams = (query ? filtered : STREAMS).filter((stream) => FPS_IDS.includes(stream.id));

  const openStream = (stream: StreamCard) => {
    setSelected(stream);
    setView('watch');
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbarLeft">
          <button type="button" className="logo" onClick={() => setView('browse')} aria-label="Open Twitch home">
            <span>Tw</span>
          </button>
          <button type="button" className="browseLink" onClick={() => setView('browse')}>
            Browse
          </button>
          <button type="button" className="dotsBtn" aria-label="More options">
            •••
          </button>
        </div>

        <div className="searchWrap">
          <input
            className="searchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
          />
          <button type="button" className="searchBtn" aria-label="Search" />
        </div>

        <div className="topbarRight">
          <button type="button" className="ghostBtn">
            Log In
          </button>
          <button type="button" className="primaryBtn">
            Sign Up
          </button>
          <button type="button" className="profileBtn" aria-label="Profile">
            ◌
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebarTop">
            <div className="sidebarTitle">Live Channels</div>
            <button type="button" className="collapseBtn" aria-label="Collapse">
              ←|
            </button>
          </div>

          <div className="channelList">
            {CHANNELS.map((channel) => (
              <button
                key={channel.name}
                type="button"
                className="channelRow"
                onClick={() => {
                  const stream = STREAMS.find((item) => item.creator.toLowerCase() === channel.name.toLowerCase());
                  if (stream) openStream(stream);
                }}
              >
                <div className="channelIdentity">
                  <div className="channelAvatar">{channel.name.slice(0, 2)}</div>
                  <div className="channelMeta">
                    <div className="channelName">{channel.name}</div>
                    <div className="channelGame">{channel.game}</div>
                  </div>
                </div>
                <div className="channelViewers">
                  <span className="liveDot" />
                  {channel.viewers}
                </div>
              </button>
            ))}
          </div>

          {view !== 'browse' && (
            <div className="sidebarTools">
              <div className="toolsLabel">ValueSkins on Twitch</div>
              <button type="button" className={`toolBtn ${view === 'mim' ? 'active' : ''}`} onClick={() => setView('mim')}>
                Network
              </button>
              <button type="button" className={`toolBtn ${view === 'store' ? 'active' : ''}`} onClick={() => setView('store')}>
                Loadout
              </button>
              <button
                type="button"
                className="toolBtn"
                onClick={() => {
                  setRole('creator');
                  setView('mim');
                }}
              >
                Streamer view
              </button>
              <button
                type="button"
                className="toolBtn"
                onClick={() => {
                  setRole('brand');
                  setView('mim');
                }}
              >
                Sponsor view
              </button>
            </div>
          )}
        </aside>

        <main className="content">
          {view === 'browse' && (
            <div className="browseView">
              <div className="featuredGrid">
                {featuredStreams.map((stream) => (
                  <button key={stream.id} type="button" className="streamCard" onClick={() => openStream(stream)}>
                    <div className="thumbFrame featured">
                      <img src={stream.thumb} alt={stream.title} className="thumb" />
                      <span className="liveBadge">LIVE</span>
                      <span className="viewerBadge">{stream.viewers} viewers</span>
                    </div>
                    <div className="cardInfo">
                      <div className="streamAvatar">{stream.creator.slice(0, 2)}</div>
                      <div className="cardText">
                        <div className="streamTitle">{stream.title}</div>
                        <div className="streamCreator">{stream.creator}</div>
                        <div className="streamGame">{stream.game}</div>
                        <div className="tagList">
                          <span className="tag">{stream.tag}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="separatorRow">
                <div className="separator" />
                <button type="button" className="showAllBtn" onClick={() => setView('mim')}>
                  Show all
                </button>
                <div className="separator" />
              </div>

              <div className="sectionBlock">
                <div className="sectionHeading">Team FPS</div>
                <div className="streamGrid">
                  {fpsStreams.map((stream) => (
                    <button key={stream.id} type="button" className="streamCard" onClick={() => openStream(stream)}>
                      <div className="thumbFrame">
                        <img src={stream.thumb} alt={stream.title} className="thumb" />
                        <span className="liveBadge">LIVE</span>
                        <span className="viewerBadge">{stream.viewers} viewers</span>
                      </div>
                      <div className="cardInfo">
                        <div className="streamAvatar">{stream.creator.slice(0, 2)}</div>
                        <div className="cardText">
                          <div className="streamTitle">{stream.title}</div>
                          <div className="streamCreator">{stream.creator}</div>
                          <div className="streamGame">{stream.game}</div>
                          <div className="tagList">
                            <span className="tag">{stream.tag}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'watch' && (
            <section className="watchLayout">
              <div className="watchMain">
                <div className="playerFrame">
                  <img src={selected.thumb} alt={selected.title} className="player" />
                </div>
                <div className="watchPanel">
                  <div className="watchHead">
                    <div>
                      <div className="watchTitle">{selected.title}</div>
                      <div className="watchMeta">
                        {selected.creator} · {selected.game} · {selected.viewers} viewers
                      </div>
                    </div>
                    <div className="watchActions">
                      <button type="button" className="pill primaryPill">Follow</button>
                      <button type="button" className="pill mutedPill">Subscribe</button>
                      <button type="button" className="pill mutedPill">Gift a Sub</button>
                      <button type="button" className="pill mutedPill" onClick={() => setView('mim')}>ValueSkins Network</button>
                      <button type="button" className="pill mutedPill" onClick={() => setView('store')}>ValueSkins Loadout</button>
                    </div>
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
                      <div key={`${message.user}-${message.text}`} className="chatMessage">
                        <strong>{message.user}</strong> {message.text}
                      </div>
                    ))}
                  </div>
                  <input className="chatInput" placeholder="Send a message" />
                </div>
              </aside>
            </section>
          )}

          {view === 'mim' && (
            <section className="panel">
              <div className="panelTitle">ValueSkins Network</div>
              <div className="panelIntro">
                On Twitch, the two sides are streamers and sponsors, including brands, publishers, and event partners.
              </div>

              {role === 'none' ? (
                <div className="roleGrid">
                  <button type="button" className="roleCard" onClick={() => setRole('creator')}>
                    <span className="roleBadge">Streamer</span>
                    <div className="roleTitle">See inbound activations</div>
                    <div className="roleText">Review paid stream integrations, audience fit, and trust signals.</div>
                  </button>
                  <button type="button" className="roleCard" onClick={() => setRole('brand')}>
                    <span className="roleBadge alt">Sponsor</span>
                    <div className="roleTitle">Find channels with real traction</div>
                    <div className="roleText">Search by game, category, and live retention.</div>
                  </button>
                </div>
              ) : role === 'creator' ? (
                <div className="listWrap">
                  <div className="status creator">Streamer mode active</div>
                  {MARKETPLACE_DEALS.map((deal) => (
                    <div key={deal} className="listItem">{deal}</div>
                  ))}
                </div>
              ) : (
                <div className="listWrap">
                  <div className="status brand">Sponsor mode active</div>
                  {BRAND_MATCHES.map((item) => (
                    <div key={item} className="listItem">{item}</div>
                  ))}
                </div>
              )}
            </section>
          )}

          {view === 'store' && (
            <section className="panel">
              <div className="panelTitle">ValueSkins Loadout</div>
              <div className="panelIntro">Channel badges streamers can turn on to signal niche, trust, and sponsor readiness.</div>
              <div className="loadoutGrid">
                {LOADOUT_ITEMS.map((item) => (
                  <div key={item} className="loadoutCard">
                    <div className="loadoutTop">
                      <span className="loadoutTag">Channel Badge</span>
                      <span className="loadoutPrice">$29</span>
                    </div>
                    <div className="loadoutTitle">{item}</div>
                    <div className="loadoutText">Use this badge to unlock more targeted matches and stronger sponsor positioning.</div>
                    <button type="button" className="buyBtn">Buy now</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {view === 'browse' && (
        <div className="bottomBanner">
          <div className="bottomBannerText">
            <div className="bannerBadge">VS</div>
            <div>
              <strong>Join the Twitch community!</strong> Discover the best live streams anywhere.
            </div>
          </div>
          <button type="button" className="bannerBtn">Sign Up</button>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #0e0e10;
          color: #efeff1;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: grid;
          grid-template-columns: auto minmax(280px, 1fr) auto;
          align-items: center;
          gap: 16px;
          height: 60px;
          padding: 0 12px;
          background: #18181b;
          border-bottom: 1px solid #2b2b31;
        }

        .topbarLeft,
        .topbarRight {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo,
        .browseLink,
        .dotsBtn,
        .ghostBtn,
        .primaryBtn,
        .profileBtn,
        .collapseBtn,
        .toolBtn,
        .searchBtn,
        .showAllBtn,
        .buyBtn,
        .pill,
        .streamCard,
        .channelRow,
        .roleCard,
        .bannerBtn {
          border: 0;
          cursor: pointer;
        }

        .logo {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #9146ff;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
        }

        .browseLink {
          background: transparent;
          color: #efeff1;
          font-size: 18px;
          font-weight: 700;
          padding: 0;
        }

        .dotsBtn,
        .profileBtn,
        .collapseBtn {
          background: transparent;
          color: #efeff1;
          font-size: 18px;
        }

        .searchWrap {
          display: grid;
          grid-template-columns: 1fr 54px;
          max-width: 560px;
          width: 100%;
          justify-self: center;
        }

        .searchInput {
          height: 48px;
          border: 1px solid #6e6e73;
          border-right: 0;
          border-radius: 10px 0 0 10px;
          background: #0f0f12;
          color: #efeff1;
          font-size: 18px;
          padding: 0 16px;
          outline: none;
        }

        .searchBtn {
          background: #2a2a31;
          border-radius: 0 10px 10px 0;
          position: relative;
        }

        .searchBtn::before {
          content: '⌕';
          color: #efeff1;
          font-size: 24px;
        }

        .ghostBtn,
        .primaryBtn {
          height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 800;
        }

        .ghostBtn {
          background: #2c2c33;
          color: #efeff1;
        }

        .primaryBtn {
          background: #9146ff;
          color: #fff;
        }

        .layout {
          display: grid;
          grid-template-columns: 328px minmax(0, 1fr);
          min-height: calc(100vh - 60px);
        }

        .sidebar {
          background: #1f1f23;
          border-right: 1px solid #2b2b31;
          padding-bottom: 92px;
        }

        .sidebarTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 12px 14px;
        }

        .sidebarTitle {
          font-size: 18px;
          font-weight: 800;
        }

        .channelList {
          display: flex;
          flex-direction: column;
        }

        .channelRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          color: #efeff1;
          text-align: left;
        }

        .channelRow:hover,
        .toolBtn:hover,
        .streamCard:hover,
        .roleCard:hover {
          background: rgba(255, 255, 255, 0.04);
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
          width: 40px;
          height: 40px;
          border-radius: 999px;
          background: linear-gradient(135deg, #6d28d9, #4f46e5);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .channelMeta,
        .cardText {
          min-width: 0;
        }

        .channelName {
          font-size: 18px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .channelGame,
        .streamGame,
        .streamCreator,
        .panelIntro,
        .roleText,
        .loadoutText,
        .watchMeta {
          color: #adadb8;
        }

        .channelGame {
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .channelViewers {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 17px;
          white-space: nowrap;
        }

        .liveDot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: #ff2b2b;
        }

        .sidebarTools {
          margin: 18px 12px 0;
          padding-top: 18px;
          border-top: 1px solid #2b2b31;
        }

        .toolsLabel {
          margin-bottom: 10px;
          color: #bf94ff;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .toolBtn {
          width: 100%;
          min-height: 40px;
          margin-bottom: 8px;
          border-radius: 10px;
          background: #18181b;
          color: #efeff1;
          font-size: 14px;
          font-weight: 700;
          text-align: left;
          padding: 0 12px;
        }

        .toolBtn.active {
          background: rgba(145, 70, 255, 0.2);
          box-shadow: inset 0 0 0 1px rgba(145, 70, 255, 0.45);
        }

        .content {
          padding: 10px 18px 100px;
        }

        .browseView {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .featuredGrid,
        .streamGrid,
        .loadoutGrid,
        .roleGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .streamCard {
          background: transparent;
          color: #efeff1;
          text-align: left;
          padding: 0;
        }

        .thumbFrame {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #2a2a31;
        }

        .thumbFrame.featured {
          border: 4px solid #9146ff;
        }

        .thumb,
        .player {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
        }

        .liveBadge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #ff2b2b;
          color: #fff;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 900;
        }

        .viewerBadge {
          position: absolute;
          left: 10px;
          bottom: 10px;
          background: rgba(0, 0, 0, 0.82);
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .cardInfo {
          display: flex;
          gap: 12px;
          padding-top: 12px;
        }

        .streamTitle {
          font-size: 18px;
          font-weight: 800;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .streamCreator,
        .streamGame {
          font-size: 17px;
          margin-top: 2px;
        }

        .tagList {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #2e2e35;
          color: #efeff1;
          font-size: 12px;
          font-weight: 700;
        }

        .separatorRow {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 18px;
          align-items: center;
        }

        .separator {
          height: 1px;
          background: #303039;
        }

        .showAllBtn {
          background: transparent;
          color: #bf94ff;
          font-size: 16px;
          font-weight: 800;
        }

        .sectionBlock {
          display: flex;
          flex-direction: column;
        }

        .sectionHeading,
        .panelTitle {
          margin-bottom: 14px;
          color: #bf94ff;
          font-size: 22px;
          font-weight: 800;
        }

        .watchLayout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 18px;
        }

        .playerFrame,
        .panel,
        .watchPanel,
        .chatCard {
          border: 1px solid #2a2a31;
          border-radius: 18px;
          background: #111114;
        }

        .watchPanel,
        .chatCard,
        .panel {
          padding: 18px;
        }

        .watchPanel {
          margin-top: 16px;
        }

        .watchHead {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .watchTitle,
        .roleTitle,
        .loadoutTitle {
          color: #fff;
          font-weight: 800;
        }

        .watchTitle {
          font-size: 26px;
        }

        .watchActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pill {
          min-height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
        }

        .primaryPill {
          background: #9146ff;
        }

        .mutedPill {
          background: #2d2d35;
        }

        .chatHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          font-weight: 800;
        }

        .chatHeader span {
          color: #adadb8;
          font-size: 12px;
        }

        .chatMessages {
          min-height: 320px;
          background: #18181b;
          border: 1px solid #2a2a31;
          border-radius: 14px;
          padding: 14px;
        }

        .chatMessage {
          margin-bottom: 10px;
          font-size: 14px;
          line-height: 1.45;
        }

        .chatMessage strong {
          color: #bf94ff;
        }

        .chatInput {
          width: 100%;
          height: 42px;
          margin-top: 12px;
          border: 1px solid #31313a;
          border-radius: 12px;
          background: #18181b;
          color: #efeff1;
          padding: 0 12px;
          outline: none;
        }

        .panelIntro {
          margin-bottom: 18px;
          font-size: 14px;
          line-height: 1.5;
        }

        .roleCard,
        .loadoutCard,
        .listItem {
          background: #18181b;
          border: 1px solid #2a2a31;
          border-radius: 16px;
          color: #efeff1;
        }

        .roleCard,
        .loadoutCard {
          padding: 18px;
          text-align: left;
        }

        .roleBadge,
        .loadoutTag,
        .status {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .roleBadge,
        .loadoutTag {
          background: rgba(145, 70, 255, 0.16);
          color: #d3b7ff;
          margin-bottom: 12px;
        }

        .roleBadge.alt {
          background: rgba(59, 130, 246, 0.16);
          color: #b6dbff;
        }

        .roleTitle {
          font-size: 22px;
          margin-bottom: 8px;
        }

        .listWrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .status.creator {
          width: fit-content;
          background: rgba(0, 214, 143, 0.16);
          color: #82f0c2;
        }

        .status.brand {
          width: fit-content;
          background: rgba(86, 204, 242, 0.16);
          color: #a4ebff;
        }

        .listItem {
          padding: 14px 16px;
          font-size: 14px;
        }

        .loadoutTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .loadoutPrice {
          color: #fff;
          font-size: 15px;
          font-weight: 800;
        }

        .loadoutTitle {
          font-size: 20px;
          margin-bottom: 8px;
        }

        .buyBtn {
          height: 42px;
          margin-top: 18px;
          padding: 0 14px;
          border-radius: 12px;
          background: #9146ff;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
        }

        .bottomBanner {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 20px;
          background: linear-gradient(90deg, #4c1d95, #6d28d9);
          color: #fff;
        }

        .bottomBannerText {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 18px;
        }

        .bannerBadge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.16);
          font-size: 14px;
          font-weight: 900;
        }

        .bannerBtn {
          height: 46px;
          padding: 0 24px;
          border-radius: 999px;
          background: #fff;
          color: #0e0e10;
          font-size: 16px;
          font-weight: 800;
        }

        @media (max-width: 1280px) {
          .featuredGrid,
          .streamGrid,
          .loadoutGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .watchLayout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 980px) {
          .topbar {
            grid-template-columns: 1fr;
            height: auto;
            padding: 10px 12px;
          }

          .layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            border-right: 0;
            border-bottom: 1px solid #2b2b31;
          }

          .roleGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .content {
            padding: 10px 12px 120px;
          }

          .featuredGrid,
          .streamGrid,
          .loadoutGrid {
            grid-template-columns: 1fr;
          }

          .topbarLeft,
          .topbarRight,
          .bottomBanner {
            flex-wrap: wrap;
          }

          .watchHead,
          .bottomBanner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

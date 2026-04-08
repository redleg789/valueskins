'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDealSync, type Campaign } from '@/lib/useDealSync';

type View = 'browse' | 'watch' | 'network' | 'loadout';
type Role = 'none' | 'streamer' | 'sponsor';

type Stream = {
  id: string;
  title: string;
  channel: string;
  game: string;
  viewers: string;
  tags: string[];
  image: string;
};

type Channel = {
  name: string;
  game: string;
  viewers: string;
  avatar: string;
  streamId?: string;
};

const TOP_STREAMS: Stream[] = [
  {
    id: 'castaway',
    title: "Where's my good boys.... Goddess ASMR l...",
    channel: 'Castaway',
    game: 'Just Chatting',
    viewers: '343',
    tags: ['girl', 'english', 'worldofwarcraft', 'ADHD'],
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'mande',
    title: 'MEET AND GREET AT Tipsy Dreamer 1-4PM ...',
    channel: 'Mande',
    game: 'Just Chatting',
    viewers: '4.1K',
    tags: ['English'],
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'arky',
    title: 'EXPLORING HAUNTED FOREST W/ @Rosiiwu...',
    channel: 'Arky',
    game: 'Just Chatting',
    viewers: '6.9K',
    tags: ['English'],
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  },
];

const TEAM_FPS_STREAMS: Stream[] = [
  {
    id: 'hamy',
    title: 'WINNING GAMES TONIGHT SUPER LOCKED IN',
    channel: 'Hamy',
    game: 'VALORANT',
    viewers: '242',
    tags: ['English'],
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'eggsterr',
    title: 'wHY AM I the GOAT',
    channel: 'eggsterr',
    game: 'VALORANT',
    viewers: '1.1K',
    tags: ['English'],
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'eslcs',
    title: 'RERUN: NAVI vs. G2 - ESL Pro League Season 23...',
    channel: 'ESLCS',
    game: 'Counter-Strike',
    viewers: '285',
    tags: ['English'],
    image: 'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1400&q=80',
  },
];

const ALL_STREAMS = [...TOP_STREAMS, ...TEAM_FPS_STREAMS];

const LIVE_CHANNELS: Channel[] = [
  { name: 'xQc', game: 'Minecraft', viewers: '23.1K', avatar: 'xQ' },
  { name: 'caseoh_', game: 'Retro Rewind: Vid...', viewers: '56K', avatar: 'ca' },
  { name: 'TBJZL', game: "I'm Only Sleeping", viewers: '681', avatar: 'tb' },
  { name: 'ESL_DOTA2', game: 'Dota 2', viewers: '167', avatar: 'ES' },
  { name: 'Lacy', game: 'Grand Theft Aut...', viewers: '15.2K', avatar: 'La' },
  { name: 'TenZ', game: 'VALORANT', viewers: '6.7K', avatar: 'Te' },
  { name: 'Faith', game: 'Just Chatting', viewers: '325', avatar: 'Fa' },
  { name: 'MarvelRivals', game: 'Marvel Rivals', viewers: '1.4K', avatar: 'MR' },
  { name: 'ion2x', game: 'VALORANT', viewers: '334', avatar: 'io' },
  { name: 'CDAwg', game: 'Just Chatting', viewers: '24.4K', avatar: 'CD' },
  { name: 'Mande', game: 'Just Chatting', viewers: '4.1K', avatar: 'Ma', streamId: 'mande' },
  { name: 'eggsterr', game: 'VALORANT', viewers: '1.1K', avatar: 'eg', streamId: 'eggsterr' },
  { name: 'Arky', game: 'Just Chatting', viewers: '6.9K', avatar: 'Ar', streamId: 'arky' },
];

const CHAT_LINES = [
  { user: 'noukhii', text: 'sens and setup posted above' },
  { user: 'fpsfan_21', text: 'clutch incoming' },
  { user: 'brandwatch', text: 'retention is insane on this stream' },
  { user: 'mod_mira', text: 'drop your favorite loadout in chat' },
];

const NETWORK_DEALS = [
  'HyperX: Sponsored live session + clipped highlight package ($3,000)',
  'Razer: Gear showcase with chat command CTA ($1,800)',
  'Corsair: Giveaway activation + stream overlay slot ($2,100)',
];

const SPONSOR_MATCHES = [
  'Mande · Just Chatting · 4.1K live viewers · High event turnout',
  'Arky · Just Chatting · 6.9K live viewers · Strong session length',
  'eggsterr · VALORANT · 1.1K live viewers · High FPS affinity',
];

const LOADOUTS = [
  'FPS Pro',
  'Chat Magnet',
  'Brand Safe',
  'Speedrunner',
  'Esports Analyst',
  'Community Builder',
];

function StreamCard({
  stream,
  featured = false,
  onOpen,
}: {
  stream: Stream;
  featured?: boolean;
  onOpen: (stream: Stream) => void;
}) {
  return (
    <button type="button" className="streamCard" onClick={() => onOpen(stream)}>
      <div className={`thumbShell ${featured ? 'featured' : ''}`}>
        <img src={stream.image} alt={stream.title} className="thumbImage" />
        <span className="livePill">LIVE</span>
        <span className="viewerPill">{stream.viewers} viewers</span>
      </div>
      <div className="streamMeta">
        <div className="streamAvatar">{stream.channel.slice(0, 2)}</div>
        <div className="streamText">
          <div className="streamTitle">{stream.title}</div>
          <div className="streamChannel">{stream.channel}</div>
          <div className="streamGame">{stream.game}</div>
          <div className="tagRow">
            {stream.tags.map((tag) => (
              <span key={tag} className="tagChip">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function TwitchDemoPage() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('browse');
  const [role, setRole] = useState<Role>('none');
  const [selected, setSelected] = useState<Stream>(TOP_STREAMS[1]);
  const [showCampaignCreator, setShowCampaignCreator] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Form states for Create Campaign
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignBudget, setNewCampaignBudget] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');

  // Simulating fetching or local persistence
  useEffect(() => {
    const saved = localStorage.getItem('twitch_campaigns');
    if (saved) setCampaigns(JSON.parse(saved));
  }, []);

  const persistCampaigns = (updated: Campaign[]) => {
    setCampaigns(updated);
    localStorage.setItem('twitch_campaigns', JSON.stringify(updated));
  };

  const q = query.trim().toLowerCase();
  const featured = useMemo(
    () =>
      TOP_STREAMS.filter((stream) =>
        q ? `${stream.title} ${stream.channel} ${stream.game} ${stream.tags.join(' ')}`.toLowerCase().includes(q) : true
      ),
    [q]
  );
  const fps = useMemo(
    () =>
      TEAM_FPS_STREAMS.filter((stream) =>
        q ? `${stream.title} ${stream.channel} ${stream.game} ${stream.tags.join(' ')}`.toLowerCase().includes(q) : true
      ),
    [q]
  );

  const openStream = (stream: Stream) => {
    setSelected(stream);
    setView('watch');
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbarLeft">
          <button type="button" className="twitchMark" onClick={() => setView('browse')} aria-label="Open Twitch browse">
            <span>Tw</span>
          </button>
          <button type="button" className="browseLabel" onClick={() => setView('browse')}>
            Browse
          </button>
          <button type="button" className="dotsButton" aria-label="More">
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
          <button type="button" className="searchButton" aria-label="Search" />
        </div>

        <div className="topbarRight">
          <button type="button" className="ghostAction">
            Log In
          </button>
          <button type="button" className="primaryAction">
            Sign Up
          </button>
          <button type="button" className="userAction" aria-label="Account">
            ◌
          </button>
        </div>
      </header>

      <div className="shell">
        <aside className="sidebar">
          <div className="sidebarHeader">
            <div className="sidebarTitle">Live Channels</div>
            <button type="button" className="collapseAction" aria-label="Collapse">
              ←|
            </button>
          </div>

          <div className="channelList">
            {LIVE_CHANNELS.map((channel) => (
              <button
                key={channel.name}
                type="button"
                className="channelRow"
                onClick={() => {
                  const stream = channel.streamId ? ALL_STREAMS.find((item) => item.id === channel.streamId) : null;
                  if (stream) openStream(stream);
                }}
              >
                <div className="channelIdentity">
                  <div className="channelAvatar">{channel.avatar}</div>
                  <div className="channelText">
                    <div className="channelName">{channel.name}</div>
                    <div className="channelGame">{channel.game}</div>
                  </div>
                </div>
                <div className="channelCount">
                  <span className="liveDot" />
                  {channel.viewers}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="content">
          {view === 'browse' && (
            <div className="browseView">
              <div className="featuredRow">
                {featured.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} featured onOpen={openStream} />
                ))}
              </div>

              <div className="dividerRow">
                <div className="dividerLine" />
                <button type="button" className="showAllLink" onClick={() => setView('network')}>
                  Show all
                </button>
                <div className="dividerLine" />
              </div>

              <section className="section">
                <div className="sectionTitle">Team FPS</div>
                <div className="streamGrid">
                  {fps.map((stream) => (
                    <StreamCard key={stream.id} stream={stream} onOpen={openStream} />
                  ))}
                </div>
              </section>
            </div>
          )}

          {view === 'watch' && (
            <div className="watchView">
              <div className="watchMain">
                <div className="playerShell">
                  <img src={selected.image} alt={selected.title} className="playerImage" />
                </div>
                <div className="watchInfo">
                  <div className="watchTop">
                    <div>
                      <div className="watchTitle">{selected.title}</div>
                      <div className="watchMeta">
                        {selected.channel} · {selected.game} · {selected.viewers} viewers
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
                      <button type="button" className="pill mutedPill" onClick={() => setView('network')}>
                        ValueSkins Network
                      </button>
                      <button type="button" className="pill mutedPill" onClick={() => setView('loadout')}>
                        ValueSkins Loadout
                      </button>
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
                  <div className="chatBody">
                    {CHAT_LINES.map((line) => (
                      <div key={`${line.user}-${line.text}`} className="chatLine">
                        <strong>{line.user}</strong> {line.text}
                      </div>
                    ))}
                  </div>
                  <input className="chatInput" placeholder="Send a message" />
                </div>
              </aside>
            </div>
          )}

          {view === 'network' && (
            <section className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div className="panelTitle" style={{ margin: 0 }}>ValueSkins Network</div>
                {role === 'sponsor' && (
                  <button
                    onClick={() => setShowCampaignCreator(true)}
                    style={{
                      background: '#9146ff', color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '10px 18px', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(145, 70, 255, 0.3)'
                    }}
                  >
                    + Create Campaign
                  </button>
                )}
              </div>
              <div className="panelIntro">
                Streamers and sponsors meet here without changing the core Twitch flow.
              </div>

              {role === 'none' ? (
                <div className="roleGrid">
                  <button type="button" className="roleCard" onClick={() => setRole('streamer')}>
                    <span className="roleBadge">Streamer</span>
                    <div className="roleTitle">See inbound activations</div>
                    <div className="roleText">Review sponsor briefs, fit, and trust signals.</div>
                  </button>
                  <button type="button" className="roleCard" onClick={() => setRole('sponsor')}>
                    <span className="roleBadge alt">Sponsor</span>
                    <div className="roleTitle">Find channels with traction</div>
                    <div className="roleText">Search by game, session length, and live quality.</div>
                  </button>
                </div>
              ) : role === 'streamer' ? (
                <div className="listStack">
                  <div className="statusPill streamer">Streamer mode active</div>
                  {NETWORK_DEALS.map((deal) => (
                    <div key={deal} className="listItem">
                      {deal}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="listStack">
                  <div className="statusPill sponsor">Sponsor mode active</div>
                  {campaigns.length === 0 ? (
                    <div style={{ background: '#18181b', border: '1px solid #2a2a31', borderRadius: '14px', padding: '32px', textAlign: 'center', marginTop: '12px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Start with a Campaign</div>
                      <div style={{ fontSize: '14px', color: '#adadb8', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                        Once you create a campaign brief, we'll match you with streamers whose metrics and audience fit your brand goals.
                      </div>
                      <button
                        onClick={() => setShowCampaignCreator(true)}
                        style={{ background: '#9146ff', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#fff', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}
                      >
                        Create Brief Now
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#adadb8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Your Campaigns</div>
                      {campaigns.map(c => (
                        <div key={c.id} style={{ background: '#18181b', border: '1px solid #2a2a31', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ fontWeight: 800, color: '#fff' }}>{c.title}</div>
                            <div style={{ color: '#9146ff', fontWeight: 800 }}>${c.budget}</div>
                          </div>
                          <div style={{ fontSize: '13px', color: '#adadb8' }}>{c.description}</div>
                        </div>
                      ))}

                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#adadb8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '24px 0 12px' }}>Recommended Streamer Matches</div>
                      {SPONSOR_MATCHES.map((match) => (
                        <div key={match} className="listItem">
                          {match}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </section>
          )}

          {/* New Campaign Modal for Twitch */}
          {showCampaignCreator && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '16px' }}>
              <div style={{ background: '#111114', borderRadius: '24px', padding: '32px', maxWidth: '440px', width: '100%', border: '1px solid #2a2a31', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <button onClick={() => setShowCampaignCreator(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#adadb8', fontSize: '24px', cursor: 'pointer' }}>×</button>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '24px', letterSpacing: '-0.5px' }}>Create Campaign Brief</div>

                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', color: '#adadb8', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Campaign Title</div>
                  <input type="text" value={newCampaignTitle} onChange={e => setNewCampaignTitle(e.target.value)} placeholder="e.g. 5x Sponsored Slots + Highlights" style={{ width: '100%', background: '#18181b', border: '1px solid #31313a', borderRadius: '12px', color: '#fff', padding: '12px 16px', fontSize: '15px', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', color: '#adadb8', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Budget ($)</div>
                  <input type="number" value={newCampaignBudget} onChange={e => setNewCampaignBudget(e.target.value)} placeholder="e.g. 2500" style={{ width: '100%', background: '#18181b', border: '1px solid #31313a', borderRadius: '12px', color: '#fff', padding: '12px 16px', fontSize: '15px', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', color: '#adadb8', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Campaign Brief</div>
                  <textarea value={newCampaignDesc} onChange={e => setNewCampaignDesc(e.target.value)} rows={3} placeholder="Describe what you want to promote and any key requirements..." style={{ width: '100%', background: '#18181b', border: '1px solid #31313a', borderRadius: '12px', color: '#fff', padding: '12px 16px', fontSize: '15px', outline: 'none', resize: 'none' }} />
                </div>

                <button
                  onClick={() => {
                    if (newCampaignTitle && newCampaignBudget) {
                      const newC: Campaign = {
                        id: Date.now(),
                        title: newCampaignTitle,
                        budget: newCampaignBudget,
                        description: newCampaignDesc,
                        status: 'open',
                        applicants: 0,
                        brandName: 'Twitch Sponsor',
                        brandProfession: 'Technology',
                        about: '',
                        requiredProfessions: [],
                        minLevel: 1,
                        maxLevel: 5,
                        deadline: '',
                        location: '',
                        nonNegotiables: [],
                        deliverables: '',
                        compensationType: 'Paid',
                        exclusivity: 'None',
                        usageRights: 'None',
                        audienceTarget: '',
                        requirements: [],
                        scriptMode: 'discussion',
                        scriptText: '',
                        escrowFunded: false,
                        creatorCount: 1,
                      };
                      persistCampaigns([...campaigns, newC]);
                      setShowCampaignCreator(false);
                      setNewCampaignTitle(''); setNewCampaignBudget(''); setNewCampaignDesc('');
                    }
                  }}
                  style={{ width: '100%', background: '#9146ff', border: 'none', borderRadius: '12px', padding: '16px', color: '#fff', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(145, 70, 255, 0.4)' }}
                >
                  Publish Campaign Brief
                </button>
              </div>
            </div>
          )}

          {view === 'loadout' && (
            <section className="panel">
              <div className="panelTitle">ValueSkins Loadout</div>
              <div className="panelIntro">Channel badges streamers can turn on to signal niche, trust, and sponsor readiness.</div>
              <div className="loadoutGrid">
                {LOADOUTS.map((item) => (
                  <div key={item} className="loadoutCard">
                    <div className="loadoutTop">
                      <span className="loadoutTag">Channel Badge</span>
                      <span className="loadoutPrice">$29</span>
                    </div>
                    <div className="loadoutTitle">{item}</div>
                    <div className="loadoutText">Use this badge to unlock more targeted matches and stronger sponsor positioning.</div>
                    <button type="button" className="buyButton">
                      Buy now
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {view === 'browse' && (
        <div className="bottomCta">
          <div className="bottomCtaText">
            <div className="bottomBadge">VS</div>
            <div>
              <strong>Join the Twitch community!</strong> Discover the best live streams anywhere.
            </div>
          </div>
          <button type="button" className="bottomButton">
            Sign Up
          </button>
        </div>
      )}

      <style jsx>{`
        .page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0e0e10;
          color: #efeff1;
          overflow: hidden;
        }

        .topbar {
          flex-shrink: 0;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 16px;
          height: 60px;
          padding: 0 12px;
          background: #18181b;
          border-bottom: 1px solid #2b2b31;
          z-index: 100;
        }

        .topbarLeft,
        .topbarRight {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .twitchMark,
        .browseLabel,
        .dotsButton,
        .ghostAction,
        .primaryAction,
        .userAction,
        .collapseAction,
        .channelRow,
        .showAllLink,
        .pill,
        .buyButton,
        .bottomButton,
        .roleCard,
        .streamCard,
        .searchButton {
          border: 0;
          cursor: pointer;
        }

        .twitchMark {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #9146ff;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
        }

        .browseLabel {
          background: transparent;
          color: #efeff1;
          font-size: 18px;
          font-weight: 700;
          padding: 0;
        }

        .dotsButton,
        .userAction,
        .collapseAction {
          background: transparent;
          color: #efeff1;
          font-size: 18px;
        }

        .searchWrap {
          display: grid;
          grid-template-columns: 1fr 52px;
          max-width: 560px;
          width: 100%;
          justify-self: center;
        }

        .searchInput {
          height: 48px;
          padding: 0 16px;
          border: 1px solid #6e6e73;
          border-right: 0;
          border-radius: 10px 0 0 10px;
          background: #0f0f12;
          color: #efeff1;
          font-size: 18px;
          outline: none;
        }

        .searchButton {
          background: #2a2a31;
          border-radius: 0 10px 10px 0;
          position: relative;
        }

        .searchButton::before {
          content: '⌕';
          color: #efeff1;
          font-size: 24px;
        }

        .ghostAction,
        .primaryAction {
          height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 800;
        }

        .ghostAction {
          background: #2c2c33;
          color: #efeff1;
        }

        .primaryAction {
          background: #9146ff;
          color: #fff;
        }

        .shell {
          flex: 1;
          display: grid;
          grid-template-columns: 240px 1fr;
          overflow: hidden;
        }

        .sidebar {
          background: #1f1f23;
          border-right: 1px solid #2b2b31;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .content {
          overflow-y: auto;
          padding: 24px;
          background: #0e0e10;
          scroll-behavior: smooth;
        }

        .sidebarHeader {
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

        .channelText,
        .streamText {
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
        .streamChannel,
        .streamGame,
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

        .channelCount {
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

        .content {
          padding: 10px 18px 100px;
        }

        .browseView {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .featuredRow,
        .streamGrid,
        .loadoutGrid,
        .roleGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .streamCard {
          background: transparent;
          color: #efeff1;
          text-align: left;
          padding: 0;
        }

        .thumbShell {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          border: 1px solid #2a2a31;
        }

        .thumbShell.featured {
          border: 4px solid #9146ff;
        }

        .thumbImage,
        .playerImage {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
        }

        .livePill {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 8px;
          border-radius: 6px;
          background: #ff2b2b;
          color: #fff;
          font-size: 12px;
          font-weight: 900;
        }

        .viewerPill {
          position: absolute;
          left: 10px;
          bottom: 10px;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.82);
          color: #fff;
          font-size: 12px;
        }

        .streamMeta {
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

        .streamChannel,
        .streamGame {
          font-size: 17px;
          margin-top: 2px;
        }

        .tagRow {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .tagChip {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #2e2e35;
          color: #efeff1;
          font-size: 12px;
          font-weight: 700;
        }

        .dividerRow {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 18px;
          align-items: center;
        }

        .dividerLine {
          height: 1px;
          background: #303039;
        }

        .showAllLink {
          background: transparent;
          color: #bf94ff;
          font-size: 16px;
          font-weight: 800;
        }

        .sectionTitle,
        .panelTitle {
          margin-bottom: 14px;
          color: #bf94ff;
          font-size: 22px;
          font-weight: 800;
        }

        .watchView {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }

        .chatRail {
          position: sticky;
          top: 0;
          height: calc(100vh - 100px);
          display: flex;
          flex-direction: column;
        }

        .playerShell,
        .watchInfo,
        .chatCard,
        .panel {
          border: 1px solid #2a2a31;
          border-radius: 18px;
          background: #111114;
        }

        .watchInfo,
        .panel {
          padding: 18px;
          margin-top: 16px;
        }

        .chatCard {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 18px;
        }

        .watchTop {
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

        .watchButtons {
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
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .primaryPill {
          background: #9146ff;
        }

        .mutedPill {
          background: #2d2d35;
        }

        .chatHeader {
          flex-shrink: 0;
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

        .chatBody {
          flex: 1;
          overflow-y: auto;
          background: #18181b;
          border: 1px solid #2a2a31;
          border-radius: 14px;
          padding: 14px;
        }

        .chatLine {
          margin-bottom: 10px;
          font-size: 14px;
          line-height: 1.45;
        }

        .chatLine strong {
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
        .statusPill {
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
          margin-bottom: 12px;
          background: rgba(145, 70, 255, 0.16);
          color: #d3b7ff;
        }

        .roleBadge.alt {
          background: rgba(59, 130, 246, 0.16);
          color: #b6dbff;
        }

        .roleTitle {
          font-size: 22px;
          margin-bottom: 8px;
        }

        .listStack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .statusPill.streamer {
          width: fit-content;
          background: rgba(0, 214, 143, 0.16);
          color: #82f0c2;
        }

        .statusPill.sponsor {
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

        .buyButton {
          height: 42px;
          margin-top: 18px;
          padding: 0 14px;
          border-radius: 12px;
          background: #9146ff;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
        }

        .bottomCta {
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

        .bottomCtaText {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 18px;
        }

        .bottomBadge {
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

        .bottomButton {
          height: 46px;
          padding: 0 24px;
          border-radius: 999px;
          background: #fff;
          color: #0e0e10;
          font-size: 16px;
          font-weight: 800;
        }

        @media (max-width: 1280px) {
          .featuredRow,
          .streamGrid,
          .loadoutGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .watchView {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 980px) {
          .topbar {
            grid-template-columns: 1fr;
            height: auto;
            padding: 10px 12px;
          }

          .shell {
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

          .featuredRow,
          .streamGrid,
          .loadoutGrid {
            grid-template-columns: 1fr;
          }

          .topbarLeft,
          .topbarRight,
          .bottomCta {
            flex-wrap: wrap;
          }

          .watchTop,
          .bottomCta {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

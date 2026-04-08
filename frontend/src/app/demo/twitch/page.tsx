'use client';

type Stream = {
  id: string;
  title: string;
  channel: string;
  subtitle?: string;
  game: string;
  viewers: string;
  tags: string[];
  image: string;
  accent?: boolean;
  badge?: string;
};

type Channel = {
  name: string;
  game: string;
  viewers: string;
  avatar: string;
  avatarImage?: string;
  note?: string;
};

const FEATURED_STREAMS: Stream[] = [
  {
    id: 'castaway',
    title: "Where's my good boys.... Goddess ASMR l...",
    channel: 'Castaway',
    game: 'Just Chatting',
    viewers: '343',
    tags: ['girl', 'english', 'worldofwarcraft', 'ADHD'],
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'mande',
    title: 'MEET AND GREET AT Tipsy Dreamer 1-4PM ...',
    channel: 'Mande',
    subtitle: 'with JOEYKAOTYK',
    game: 'Just Chatting',
    viewers: '4.1K',
    tags: ['English'],
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80',
    accent: true,
  },
  {
    id: 'arky',
    title: 'EXPLORING HAUNTED FOREST W/ @Rosiiwu...',
    channel: 'Arky',
    subtitle: '+ 4',
    game: 'Just Chatting',
    viewers: '6.9K',
    tags: ['English'],
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
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
    image:
      'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'eggsterr',
    title: 'wHY AM I the GOAT',
    channel: 'eggsterr',
    game: 'VALORANT',
    viewers: '1.1K',
    tags: ['English'],
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'eslcs',
    title: 'RERUN: NAVI vs. G2 - ESL Pro League Season 23...',
    channel: 'ESLCS',
    game: 'Counter-Strike',
    viewers: '285',
    tags: ['English'],
    image:
      'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1400&q=80',
  },
];

const LIVE_CHANNELS: Channel[] = [
  { name: 'xQc', game: 'Minecraft', viewers: '23.1K', avatar: 'xQ', avatarImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
  { name: 'caseoh_', game: 'Retro Rewind: Vid...', viewers: '56K', avatar: 'ca', avatarImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80' },
  { name: 'TBJZL', game: "I'm Only Sleeping", viewers: '681', avatar: 'tb', avatarImage: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=120&q=80' },
  { name: 'ESL_DOTA2', game: 'Dota 2', viewers: '167', avatar: 'ES', avatarImage: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=120&q=80' },
  { name: 'Lacy', game: 'Grand Theft Aut...', viewers: '15.2K', avatar: 'La', avatarImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', note: 'Hype Train • Level 1' },
  { name: 'TenZ', game: 'VALORANT', viewers: '6.7K', avatar: 'Te', avatarImage: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=120&q=80' },
  { name: 'Faith', game: 'Just Chatting', viewers: '325', avatar: 'Fa', avatarImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80' },
  { name: 'MarvelRivals', game: 'Marvel Rivals', viewers: '1.4K', avatar: 'MR', avatarImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80' },
  { name: 'ion2x', game: 'VALORANT', viewers: '334', avatar: 'io', avatarImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80' },
  { name: 'CDAwg', game: 'Just Chatting', viewers: '24.4K', avatar: 'CD', avatarImage: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=120&q=80' },
];

function TwitchGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 2 2 6v14h5v3l3-3h4l8-8V2H4Zm16 9-4 4h-4l-3 3v-3H4V4h16v7Z" />
      <path d="M17 6h-2v5h2V6Zm-5 0h-2v5h2V6Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 4a6 6 0 1 0 3.87 10.58l4.27 4.27 1.41-1.41-4.27-4.27A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 9.8 4.3 6.7 4 6 7.1 3.3 9.2 5 12l-1.7 2.8L6 16.9l.7 3.1 3.1-.3L12 22l2.2-2.3 3.1.3.7-3.1 2.7-2.1L19 12l1.7-2.8L18 7.1 17.3 4l-3.1.3L12 2Zm-1.1 13.2-3-3 1.4-1.4 1.6 1.6 3.8-3.8 1.4 1.4-5.2 5.2Z" />
    </svg>
  );
}

function StreamCard({ stream }: { stream: Stream }) {
  return (
    <article className="streamCard">
      <div className={`thumbShell${stream.accent ? ' accent' : ''}`}>
        <img src={stream.image} alt={stream.title} className="thumbImage" />
        <span className="livePill">LIVE</span>
        <span className="viewerPill">{stream.viewers} viewers</span>
      </div>
      <div className="streamMeta">
        <div className="streamAvatar">{stream.channel.slice(0, 2)}</div>
        <div className="streamText">
          <h3>{stream.title}</h3>
          <div className="channelRow">
            <span>{stream.channel}</span>
            <span className="verifiedIcon">
              <VerifiedIcon />
            </span>
            {stream.subtitle ? <span className="subtitleText">{stream.subtitle}</span> : null}
            {stream.subtitle ? <span className="caret">⌄</span> : null}
          </div>
          <p>{stream.game}</p>
          <div className="tagRow">
            {stream.tags.map((tag) => (
              <span key={tag} className="tagChip">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TwitchDemoPage() {
  return (
    <div className="page">
      <header className="topbar">
        <div className="topbarLeft">
          <div className="brandBadge" aria-label="Twitch">
            <TwitchGlyph />
          </div>
          <button type="button" className="browseButton">
            Browse
          </button>
          <button type="button" className="dotsButton" aria-label="More">
            ⋮
          </button>
        </div>

        <div className="searchWrap">
          <input
            defaultValue=""
            className="searchInput"
            placeholder="Search"
            aria-label="Search streams"
          />
          <button type="button" className="searchButton" aria-label="Search">
            <SearchIcon />
          </button>
        </div>

        <div className="topbarRight">
          <button type="button" className="ghostButton">
            Log In
          </button>
          <button type="button" className="primaryButton">
            Sign Up
          </button>
          <button type="button" className="userButton" aria-label="Account">
            <UserIcon />
          </button>
        </div>
      </header>

      <div className="shell">
        <aside className="sidebar">
          <div className="sidebarHeader">
            <h2>Live Channels</h2>
            <button type="button" className="collapseButton" aria-label="Collapse">
              ←|
            </button>
          </div>

          <div className="channelList">
            {LIVE_CHANNELS.map((channel) => (
              <button key={channel.name} type="button" className="channelRowButton">
                <div className="channelIdentity">
                  <div className="channelAvatar">
                    {channel.avatarImage ? (
                      <img src={channel.avatarImage} alt={channel.name} className="channelAvatarImage" />
                    ) : (
                      channel.avatar
                    )}
                  </div>
                  <div className="channelText">
                    <div className="channelName">{channel.name}</div>
                    <div className="channelGame">{channel.game}</div>
                    {channel.note ? <div className="channelNote">{channel.note}</div> : null}
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
          <section className="featuredGrid">
            {FEATURED_STREAMS.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </section>

          <div className="dividerRow">
            <div className="dividerLine" />
            <button type="button" className="showAllButton">
              Show all
              <span>›</span>
            </button>
            <div className="dividerLine" />
          </div>

          <section className="section">
            <h2>Team FPS</h2>
            <div className="streamGrid">
              {TEAM_FPS_STREAMS.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          </section>
        </main>
      </div>

      <footer className="promoBar">
        <div className="promoLeft">
          <div className="promoMascot">
            <TwitchGlyph />
          </div>
          <p>
            <strong>Join the Twitch community!</strong> Discover the best live streams anywhere.
          </p>
        </div>
        <button type="button" className="promoButton">
          Sign Up
        </button>
      </footer>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #0e0e10;
          color: #efeff1;
          padding-bottom: 78px;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          height: 60px;
          padding: 0 12px 0 0;
          background: #18181b;
          border-bottom: 1px solid #2a2a31;
        }

        .topbarLeft,
        .topbarRight {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 0 0 auto;
        }

        .topbarRight {
          padding-right: 8px;
        }

        .brandBadge {
          display: grid;
          place-items: center;
          width: 60px;
          height: 60px;
          background: #18181b;
          color: #a970ff;
          border-right: 1px solid #2a2a31;
        }

        .brandBadge svg {
          width: 28px;
          height: 28px;
          fill: currentColor;
        }

        .browseButton,
        .dotsButton {
          color: #efeff1;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .dotsButton {
          font-size: 26px;
          line-height: 1;
          width: 28px;
        }

        .searchWrap {
          flex: 1;
          display: flex;
          justify-content: center;
          min-width: 0;
          padding: 0 20px;
        }

        .searchInput {
          width: min(100%, 550px);
          height: 40px;
          padding: 0 18px;
          background: #0e0e10;
          border: 1px solid #5b5b66;
          border-right: 0;
          color: #efeff1;
          font-size: 16px;
          border-radius: 8px 0 0 8px;
        }

        .searchInput::placeholder {
          color: #adadb8;
        }

        .searchButton {
          display: grid;
          place-items: center;
          width: 52px;
          height: 40px;
          background: #3a3a44;
          border-radius: 0 8px 8px 0;
          color: #efeff1;
        }

        .searchButton svg,
        .userButton svg {
          width: 22px;
          height: 22px;
          fill: currentColor;
        }

        .ghostButton,
        .primaryButton {
          height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
        }

        .ghostButton {
          background: #2b2b33;
          color: #efeff1;
        }

        .primaryButton {
          background: #a970ff;
          color: #fff;
        }

        .userButton {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          color: #efeff1;
        }

        .shell {
          display: flex;
          min-height: calc(100vh - 138px);
        }

        .sidebar {
          position: sticky;
          top: 60px;
          width: 320px;
          height: calc(100vh - 138px);
          background: #1f1f23;
          border-right: 1px solid #2a2a31;
          padding: 20px 14px;
          overflow: auto;
        }

        .sidebarHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .sidebarHeader h2 {
          font-size: 18px;
          font-weight: 800;
        }

        .collapseButton {
          color: #efeff1;
          font-size: 22px;
          line-height: 1;
        }

        .channelList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .channelRowButton {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: left;
          border-radius: 8px;
          padding: 2px 0;
        }

        .channelIdentity {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .channelAvatar {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #5f5f73, #2d2d35);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          flex: 0 0 auto;
          overflow: hidden;
        }

        .channelAvatarImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .channelText {
          min-width: 0;
        }

        .channelName {
          font-size: 17px;
          font-weight: 700;
          line-height: 1.1;
        }

        .channelGame {
          color: #adadb8;
          font-size: 13px;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .channelNote {
          margin-top: 2px;
          color: #bf94ff;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .channelCount {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          color: #efeff1;
          flex: 0 0 auto;
        }

        .liveDot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff2e2e;
        }

        .content {
          flex: 1;
          min-width: 0;
          padding: 18px 30px 24px 32px;
        }

        .featuredGrid,
        .streamGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 26px 18px;
        }

        .streamCard {
          min-width: 0;
        }

        .thumbShell {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          background: #18181b;
          border: 1px solid transparent;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          margin-bottom: 10px;
        }

        .thumbShell.accent {
          box-shadow: 0 0 0 4px #9146ff, 8px 8px 0 rgba(0, 0, 0, 0.45);
        }

        .streamCard:hover .thumbShell {
          transform: translateY(-2px);
        }

        .thumbImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .livePill {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 8px;
          background: #ff2e2e;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          border-radius: 4px;
        }

        .viewerPill {
          position: absolute;
          left: 12px;
          bottom: 12px;
          padding: 3px 7px;
          background: rgba(0, 0, 0, 0.78);
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          border-radius: 4px;
        }

        .streamMeta {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding-top: 0;
        }

        .streamAvatar {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d95cff, #5f68ff);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          flex: 0 0 auto;
        }

        .streamText {
          min-width: 0;
        }

        .streamText h3 {
          font-size: 17px;
          font-weight: 700;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          letter-spacing: -0.01em;
        }

        .channelRow {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          color: #adadb8;
          font-size: 14px;
          flex-wrap: wrap;
        }

        .verifiedIcon {
          display: inline-flex;
          color: #a970ff;
        }

        .verifiedIcon :global(svg) {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }

        .subtitleText,
        .caret,
        .streamText p {
          color: #c9c9d0;
        }

        .streamText p {
          margin-top: 0;
          font-size: 14px;
        }

        .tagRow {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .tagChip {
          padding: 4px 10px;
          border-radius: 999px;
          background: #2b2b33;
          color: #efeff1;
          font-size: 12px;
          font-weight: 700;
        }

        .dividerRow {
          display: flex;
          align-items: center;
          gap: 24px;
          margin: 18px 0 46px;
        }

        .dividerLine {
          flex: 1;
          height: 1px;
          background: #2a2a31;
        }

        .showAllButton {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #bf94ff;
          font-size: 16px;
          font-weight: 800;
          white-space: nowrap;
        }

        .section h2 {
          margin-bottom: 16px;
          color: #bf94ff;
          font-size: 18px;
          font-weight: 800;
        }

        .promoBar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          min-height: 80px;
          padding: 12px 18px;
          background: linear-gradient(90deg, #5c16c5, #772ce8);
          color: #fff;
          box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.08);
        }

        .promoLeft {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .promoMascot {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.14);
        }

        .promoMascot svg {
          width: 28px;
          height: 28px;
          fill: currentColor;
        }

        .promoLeft p {
          font-size: 17px;
        }

        .promoLeft strong {
          font-weight: 800;
        }

        .promoButton {
          flex: 0 0 auto;
          min-width: 124px;
          height: 46px;
          padding: 0 24px;
          border-radius: 999px;
          background: #fff;
          color: #0e0e10;
          font-size: 17px;
          font-weight: 800;
        }

        @media (max-width: 1200px) {
          .sidebar {
            width: 260px;
          }

          .featuredGrid,
          .streamGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .topbar {
            flex-wrap: wrap;
            height: auto;
            padding: 12px;
          }

          .searchWrap {
            order: 3;
            width: 100%;
          }

          .shell {
            display: block;
          }

          .sidebar {
            width: 100%;
            border-right: 0;
            border-bottom: 1px solid #2a2a31;
          }

          .featuredGrid,
          .streamGrid {
            grid-template-columns: 1fr;
          }

          .content {
            padding: 18px 16px 24px;
          }

          .promoBar {
            padding: 14px;
          }
        }

        @media (max-width: 640px) {
          .topbarRight {
            gap: 8px;
          }

          .ghostButton {
            display: none;
          }

          .browseButton {
            font-size: 16px;
          }

          .channelName,
          .streamText h3 {
            font-size: 17px;
          }

          .channelRow,
          .streamText p,
          .viewerPill,
          .promoLeft p {
            font-size: 15px;
          }

          .promoBar {
            flex-direction: column;
            align-items: flex-start;
          }

          .promoButton {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

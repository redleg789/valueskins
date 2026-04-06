'use client';

import { type CSSProperties, useMemo, useState } from 'react';

type Video = {
  id: string;
  title: string;
  channel: string;
  views: string;
  uploaded: string;
  duration: string;
  thumbnail: string;
  embedUrl: string;
  description: string;
  subscribers: string;
};

type Comment = {
  id: string;
  author: string;
  text: string;
  likes: number;
  age: string;
};

const VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Build a Rust API in 15 minutes',
    channel: 'CodePulse',
    views: '842K views',
    uploaded: '2 weeks ago',
    duration: '15:12',
    thumbnail: 'https://i.ytimg.com/vi/5z5mDsQH4z0/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/5z5mDsQH4z0',
    description: 'Fast walkthrough to build and ship a production-ready Rust API with structured logging and health probes.',
    subscribers: '1.2M',
  },
  {
    id: 'v2',
    title: 'System Design: Rate Limiter from scratch',
    channel: 'Infra Simplified',
    views: '1.1M views',
    uploaded: '1 month ago',
    duration: '22:41',
    thumbnail: 'https://i.ytimg.com/vi/8Rn_7A3fW0o/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/8Rn_7A3fW0o',
    description: 'Designing a distributed rate limiter with Redis, token buckets, and fallback behavior.',
    subscribers: '980K',
  },
  {
    id: 'v3',
    title: 'Next.js App Router Crash Course',
    channel: 'Frontend Forge',
    views: '673K views',
    uploaded: '5 days ago',
    duration: '18:54',
    thumbnail: 'https://i.ytimg.com/vi/7fYw8S4Yj2A/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/7fYw8S4Yj2A',
    description: 'Routing, server components, and deployment patterns for real-world Next.js apps.',
    subscribers: '540K',
  },
  {
    id: 'v4',
    title: 'How recommendation systems really work',
    channel: 'Data Demystified',
    views: '2.4M views',
    uploaded: '3 months ago',
    duration: '27:10',
    thumbnail: 'https://i.ytimg.com/vi/n3RKsY2H-NE/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/n3RKsY2H-NE',
    description: 'Candidate generation, ranking, and feedback loops explained with practical examples.',
    subscribers: '2.1M',
  },
  {
    id: 'v5',
    title: 'PostgreSQL query tuning for backend engineers',
    channel: 'DB Deep Dive',
    views: '392K views',
    uploaded: '4 days ago',
    duration: '12:32',
    thumbnail: 'https://i.ytimg.com/vi/HM2wVn2wQjE/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/HM2wVn2wQjE',
    description: 'Indexes, query plans, and practical query rewrites that immediately improve p95 latency.',
    subscribers: '317K',
  },
  {
    id: 'v6',
    title: 'Distributed tracing in production',
    channel: 'Ops in Motion',
    views: '521K views',
    uploaded: '2 months ago',
    duration: '19:08',
    thumbnail: 'https://i.ytimg.com/vi/R4w6x9q8fOE/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/R4w6x9q8fOE',
    description: 'Instrumenting microservices with OpenTelemetry and turning traces into debugging superpowers.',
    subscribers: '870K',
  },
];

const INITIAL_COMMENTS: Comment[] = [
  { id: 'c1', author: 'Ananya Dev', text: 'The pacing and examples are super clear. This helped me ship faster.', likes: 324, age: '2 days ago' },
  { id: 'c2', author: 'CloudNinja', text: 'Please make a follow-up on failure modes and incident response.', likes: 148, age: '1 day ago' },
  { id: 'c3', author: 'BackendBro', text: 'Watching this while refactoring our gateway service. Perfect timing.', likes: 96, age: '10 hours ago' },
];

const TABS = ['All', 'Rust', 'System Design', 'Backend', 'Frontend', 'DevOps', 'Startups'];

export default function YouTubeDemoPage() {
  const [query, setQuery] = useState('');
  const [activeVideoId, setActiveVideoId] = useState(VIDEOS[0].id);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [selectedTab, setSelectedTab] = useState('All');
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);

  const activeVideo = useMemo(
    () => VIDEOS.find((video) => video.id === activeVideoId) || VIDEOS[0],
    [activeVideoId],
  );

  const filteredVideos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return VIDEOS.filter((video) => {
      const textMatch =
        !normalizedQuery ||
        `${video.title} ${video.channel}`.toLowerCase().includes(normalizedQuery);
      const tabMatch =
        selectedTab === 'All' ||
        video.title.toLowerCase().includes(selectedTab.toLowerCase());
      return textMatch && tabMatch;
    });
  }, [query, selectedTab]);

  const upNext = VIDEOS.filter((video) => video.id !== activeVideo.id);

  const handleAddComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;

    setComments((prev) => [
      {
        id: `c-${Date.now()}`,
        author: 'You',
        text: trimmed,
        likes: 0,
        age: 'Just now',
      },
      ...prev,
    ]);
    setCommentInput('');
  };

  return (
    <div style={{ background: '#0f0f0f', color: '#f1f1f1', minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0f0f0f', borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '10px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <div style={{ width: 30, height: 20, borderRadius: 5, background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderLeft: '8px solid white', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', marginLeft: 2 }} />
            </div>
            <span>YouTube Clone</span>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            style={{
              flex: 1,
              maxWidth: 620,
              background: '#121212',
              border: '1px solid #333',
              borderRadius: 999,
              color: '#f1f1f1',
              padding: '10px 16px',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{ background: '#232323', color: '#f1f1f1', border: '1px solid #333', borderRadius: 999, padding: '8px 14px', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, padding: 16 }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Home', 'Shorts', 'Subscriptions', 'Library', 'History'].map((item) => (
            <button
              key={item}
              type="button"
              style={{
                textAlign: 'left',
                background: item === 'Home' ? '#272727' : 'transparent',
                color: '#f1f1f1',
                border: 'none',
                borderRadius: 10,
                padding: '10px 12px',
                cursor: 'pointer',
              }}
            >
              {item}
            </button>
          ))}
        </aside>

        <main style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 16 }}>
          <section>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12 }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedTab(tab)}
                  style={{
                    background: selectedTab === tab ? '#f1f1f1' : '#272727',
                    color: selectedTab === tab ? '#0f0f0f' : '#f1f1f1',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000', borderRadius: 12, overflow: 'hidden' }}>
              <iframe
                src={activeVideo.embedUrl}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>

            <h1 style={{ marginTop: 12, marginBottom: 8, fontSize: 22 }}>{activeVideo.title}</h1>
            <p style={{ color: '#aaa', margin: 0 }}>{activeVideo.views} • {activeVideo.uploaded}</p>

            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{activeVideo.channel}</strong>
                <p style={{ margin: 0, color: '#aaa' }}>{activeVideo.subscribers} subscribers</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setSubscribed((v) => !v)} style={actionBtnStyle(subscribed)}>{subscribed ? 'Subscribed' : 'Subscribe'}</button>
                <button type="button" onClick={() => setLiked((v) => !v)} style={actionBtnStyle(liked)}>{liked ? 'Liked' : 'Like'}</button>
                <button type="button" onClick={() => setSaved((v) => !v)} style={actionBtnStyle(saved)}>{saved ? 'Saved' : 'Save'}</button>
              </div>
            </div>

            <div style={{ marginTop: 12, background: '#1e1e1e', borderRadius: 12, padding: 12 }}>
              <p style={{ margin: 0, color: '#ddd' }}>{activeVideo.description}</p>
            </div>

            <div style={{ marginTop: 20 }}>
              <h2 style={{ fontSize: 18, marginBottom: 10 }}>{comments.length} Comments</h2>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment"
                  style={{ flex: 1, background: '#121212', border: '1px solid #333', borderRadius: 10, color: '#fff', padding: '10px 12px' }}
                />
                <button type="button" onClick={handleAddComment} style={actionBtnStyle(true)}>Post</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {comments.map((comment) => (
                  <article key={comment.id} style={{ background: '#171717', border: '1px solid #2b2b2b', borderRadius: 10, padding: 10 }}>
                    <strong>{comment.author}</strong>
                    <p style={{ margin: '6px 0', color: '#ddd' }}>{comment.text}</p>
                    <small style={{ color: '#999' }}>{comment.likes} likes • {comment.age}</small>
                  </article>
                ))}
              </div>
            </div>

            {filteredVideos.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ marginBottom: 10 }}>Recommended</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {filteredVideos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setActiveVideoId(video.id)}
                      style={{ background: '#151515', border: '1px solid #2a2a2a', borderRadius: 10, padding: 0, textAlign: 'left', cursor: 'pointer', color: '#f1f1f1' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img src={video.thumbnail} alt={video.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderTopLeftRadius: 10, borderTopRightRadius: 10 }} />
                        <span style={{ position: 'absolute', right: 6, bottom: 6, background: 'rgba(0,0,0,0.8)', borderRadius: 4, padding: '2px 5px', fontSize: 12 }}>{video.duration}</span>
                      </div>
                      <div style={{ padding: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{video.title}</div>
                        <div style={{ color: '#aaa', marginTop: 4, fontSize: 13 }}>{video.channel}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={{ margin: 0, marginBottom: 4 }}>Up next</h3>
            {upNext.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => setActiveVideoId(video.id)}
                style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, background: '#151515', border: '1px solid #2a2a2a', borderRadius: 10, padding: 8, textAlign: 'left', cursor: 'pointer', color: '#fff' }}
              >
                <div style={{ position: 'relative' }}>
                  <img src={video.thumbnail} alt={video.title} style={{ width: '100%', aspectRatio: '16/9', borderRadius: 8, objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', right: 6, bottom: 6, background: 'rgba(0,0,0,0.8)', borderRadius: 4, padding: '1px 5px', fontSize: 11 }}>{video.duration}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{video.title}</div>
                  <div style={{ color: '#aaa', fontSize: 13 }}>{video.channel}</div>
                  <div style={{ color: '#999', fontSize: 12, marginTop: 3 }}>{video.views} • {video.uploaded}</div>
                </div>
              </button>
            ))}
          </aside>
        </main>
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          main { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 820px) {
          div[style*='grid-template-columns: 220px 1fr'] {
            grid-template-columns: 1fr !important;
          }

          aside {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function actionBtnStyle(active: boolean): CSSProperties {
  return {
    border: '1px solid #3a3a3a',
    background: active ? '#f1f1f1' : '#272727',
    color: active ? '#0f0f0f' : '#f1f1f1',
    borderRadius: 999,
    padding: '9px 14px',
    fontWeight: 600,
    cursor: 'pointer',
  };
}

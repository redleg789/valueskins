'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Wall {
  id: string;
  name: string;
  description: string;
  members: number;
  weeklyEntries: number;
  icon: string;
}

interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistAvatar: string;
  imageUrl: string;
  votes: number;
  hasVoted: boolean;
  submittedAt: string;
  tags: string[];
}

export default function CommunityWalls() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  const walls: Wall[] = [
    { id: 'digital-art', name: 'Digital Art', description: 'Showcase your digital creations', members: 12400, weeklyEntries: 89, icon: 'palette' },
    { id: 'photography', name: 'Photography', description: 'Capture moments in time', members: 8900, weeklyEntries: 67, icon: 'photo_camera' },
    { id: '3d-art', name: '3D Creations', description: 'Three-dimensional masterpieces', members: 5600, weeklyEntries: 34, icon: 'view_in_ar' },
    { id: 'concept-art', name: 'Concept Art', description: 'Visualize the impossible', members: 4500, weeklyEntries: 28, icon: 'brush' },
  ];

  const weeklyWinner: Artwork = {
    id: 'winner-1',
    title: 'Neon City Dreams',
    artist: 'Neon Dreams',
    artistAvatar: 'https://via.placeholder.com/100',
    imageUrl: 'https://via.placeholder.com/800x600',
    votes: 1247,
    hasVoted: true,
    submittedAt: '2024-03-10',
    tags: ['#digitalart', '#neon', '#cyberpunk'],
  };

  const currentEntries: Artwork[] = [
    { id: 'entry-1', title: 'Abstract Emotions', artist: 'The Voyager', artistAvatar: 'https://via.placeholder.com/100', imageUrl: 'https://via.placeholder.com/400x300', votes: 423, hasVoted: false, submittedAt: '2024-03-14', tags: ['#abstract', '#art'] },
    { id: 'entry-2', title: 'Mountain Sunrise', artist: 'Pixel Pioneer', artistAvatar: 'https://via.placeholder.com/100', imageUrl: 'https://via.placeholder.com/400x300', votes: 389, hasVoted: false, submittedAt: '2024-03-13', tags: ['#nature', '#landscape'] },
    { id: 'entry-3', title: 'Future Interface', artist: 'Code Canvas', artistAvatar: 'https://via.placeholder.com/100', imageUrl: 'https://via.placeholder.com/400x300', votes: 356, hasVoted: false, submittedAt: '2024-03-12', tags: ['#scifi', '#tech'] },
    { id: 'entry-4', title: 'Portrait Study', artist: 'Sound Sculptor', artistAvatar: 'https://via.placeholder.com/100', imageUrl: 'https://via.placeholder.com/400x300', votes: 312, hasVoted: false, submittedAt: '2024-03-11', tags: ['#portrait', '#character'] },
  ];

  const handleVote = (entryId: string) => {
    console.log('Vote for:', entryId);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-20">
          <span className="text-3xl font-black italic -rotate-2 tracking-tighter text-primary bg-surface-container-highest px-4 py-1 rounded-sm shadow-[4px_4px_0px_0px_rgba(213,0,249,0.3)] font-headline">
            Nexus
          </span>
          <div className="flex items-center gap-6 text-primary">
            <button className="hover:text-primary hover:bg-zinc-800/50 transition-all p-2 rounded-full">
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </button>
            <button className="hover:text-primary hover:bg-zinc-800/50 transition-all p-2 rounded-full">
              <span className="material-symbols-outlined text-2xl">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Side Navigation */}
        <nav className="hidden md:flex flex-col h-[calc(100vh-5rem)] w-64 bg-surface border-r border-zinc-800/20 fixed left-0 py-8 gap-6 z-40 overflow-y-auto">
          <div className="px-6 mb-4">
            <div className="flex items-center gap-4 cursor-pointer">
              <div className="avatar-ring">
                <img alt="User Profile" className="w-full h-full object-cover" src="https://via.placeholder.com/48" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface">The Voyager</h3>
                <p className="text-xs text-primary font-label tracking-widest uppercase">Digital Alchemist</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 font-label uppercase tracking-widest text-xs">
            <a className="nav-item" href="/">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>Feed</span>
            </a>
            <a className="nav-item" href="/discover">
              <span className="material-symbols-outlined">explore</span>
              <span>Discover</span>
            </a>
            <a className="nav-item" href="/chat">
              <span className="material-symbols-outlined">chat_bubble</span>
              <span>Messages</span>
            </a>
            <a className="nav-item" href="/wall">
              <span className="material-symbols-outlined">book</span>
              <span>Grimoire</span>
            </a>
            <a className="nav-item-active" href="/community">
              <span className="material-symbols-outlined">groups</span>
              <span>Community Walls</span>
            </a>
          </div>
        </nav>

        {/* Main Content */}
        <main className="w-full md:ml-64 p-4 md:p-8 lg:p-12 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-headline font-black italic mb-2">Community Walls</h1>
                <p className="text-on-surface-variant">Weekly artwork competitions</p>
              </div>
              <button className="btn-primary">
                <span className="material-symbols-outlined mr-2">add</span>
                Submit Artwork
              </button>
            </div>

            {/* Weekly Winner */}
            <div className="mb-12">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-primary-container marker-bg -rotate-2 scale-110 opacity-80"></div>
                <h2 className="relative text-2xl font-headline font-black italic text-on-primary-container px-4 py-2">
                  This Week's Winner
                </h2>
              </div>
              
              <div className="card-glow p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute -top-4 -left-4 bg-primary text-on-primary px-4 py-2 font-headline font-bold italic rounded-sm shadow-lg z-10">
                        <span className="material-symbols-outlined mr-1">emoji_events</span>
                        Winner
                      </div>
                      <img src={weeklyWinner.imageUrl} alt={weeklyWinner.title} className="w-full rounded-sm" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-headline font-bold text-primary mb-2">{weeklyWinner.title}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
                        <img alt={weeklyWinner.artist} className="w-full h-full object-cover" src={weeklyWinner.artistAvatar} />
                      </div>
                      <span className="font-headline font-bold text-secondary">{weeklyWinner.artist}</span>
                    </div>
                    <p className="text-on-surface-variant mb-4">Submitted {weeklyWinner.submittedAt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {weeklyWinner.tags.map((tag) => (
                        <span key={tag} className="tag-secondary">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-headline font-bold text-primary">{weeklyWinner.votes.toLocaleString()} votes</span>
                      <span className="material-symbols-outlined text-2xl text-secondary">verified</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-2">This artwork will be featured on the homepage for the next week!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Walls Browser */}
            <div className="mb-12">
              <h2 className="text-2xl font-headline font-bold mb-4">Browse Walls</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {walls.map((wall) => (
                  <div key={wall.id} className="card-surface p-6 hover:bg-surface-container-high transition-colors cursor-pointer text-center">
                    <span className="material-symbols-outlined text-4xl text-primary mb-3">{wall.icon}</span>
                    <h3 className="font-headline font-bold text-lg text-primary mb-1">{wall.name}</h3>
                    <p className="text-sm text-on-surface-variant mb-2">{wall.description}</p>
                    <p className="text-xs text-on-surface-variant">{wall.members.toLocaleString()} members</p>
                    <p className="text-xs text-secondary mt-1">{wall.weeklyEntries} entries this week</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Entries */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-headline font-bold">Current Week Entries</h2>
                <p className="text-sm text-on-surface-variant">Voting ends in 3 days</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentEntries.map((entry) => (
                  <div key={entry.id} className="card-surface overflow-hidden group">
                    <div className="relative">
                      <img src={entry.imageUrl} alt={entry.title} className="w-full aspect-video object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <button
                          onClick={() => handleVote(entry.id)}
                          className={`btn-primary w-full ${entry.hasVoted ? 'bg-secondary' : ''}`}
                        >
                          {entry.hasVoted ? 'Voted' : 'Vote'}
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-headline font-bold text-primary mb-2">{entry.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-surface-container-highest overflow-hidden">
                          <img alt={entry.artist} className="w-full h-full object-cover" src={entry.artistAvatar} />
                        </div>
                        <span className="text-xs text-on-surface-variant">{entry.artist}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {entry.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs text-secondary">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-bold text-primary">{entry.votes} votes</span>
                        <span className="text-xs text-on-surface-variant">{entry.submittedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
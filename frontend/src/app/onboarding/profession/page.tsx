'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePlatform } from '@/lib/context';
import {
  getProfessionsByPlatform,
  getProfessionsByCategory,
  Profession,
  default as PROFESSIONS,
} from '@/lib/professions';

type Category = 'Tech' | 'Art' | 'Law' | 'Medical' | 'Gaming' | 'Finance' | 'Fitness' | 'Content';

export default function ProfessionSelectionPage() {
  const { activePlatform } = usePlatform();
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tech');
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);
  const [search, setSearch] = useState('');

  const categories: Category[] = ['Tech', 'Art', 'Law', 'Medical', 'Gaming', 'Finance', 'Fitness', 'Content'];

  // Get professions for this platform and category
  const professions = useMemo(() => {
    const byCategory = getProfessionsByCategory(selectedCategory, activePlatform);
    if (!search) return byCategory;
    return byCategory.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [selectedCategory, search, activePlatform]);

  const categoryCount = (cat: Category) => {
    return getProfessionsByCategory(cat, activePlatform).length;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#000000',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px',
        background: 'rgba(0,0,0,0.5)',
        borderBottom: '1px solid #262626',
      }}>
        <Link href="/onboarding" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#f5f5f5',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
          }}>
            ← Back
          </button>
        </Link>
        <h1 style={{ fontSize: 24, marginTop: 12, marginBottom: 8, fontWeight: 700 }}>
          Choose Your Profession
        </h1>
        <p style={{ fontSize: 13, color: '#737373' }}>
          {activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)} • {professions.length} available
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #262626' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#1a1a1a',
          borderRadius: 8,
          padding: '8px 12px',
          border: '1px solid #262626',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search professions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              flex: 1,
              fontSize: 14,
              color: '#f5f5f5',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Categories sidebar */}
        <div style={{
          width: 120,
          borderRight: '1px solid #262626',
          overflowY: 'auto',
          padding: '8px 0',
        }}>
          {categories.map(cat => {
            const count = categoryCount(cat);
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  width: '100%',
                  padding: '12px 12px',
                  textAlign: 'left',
                  background: isSelected ? '#1a1a1a' : 'transparent',
                  border: 'none',
                  borderLeft: isSelected ? '3px solid #8b5cf6' : '3px solid transparent',
                  color: isSelected ? '#f5f5f5' : '#737373',
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat}
                <span style={{ display: 'block', fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                  {count} prof.
                </span>
              </button>
            );
          })}
        </div>

        {/* Professions list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {professions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#737373' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 14 }}>No professions found for "{search}"</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {professions.map(prof => {
                const isSelected = selectedProfession?.id === prof.id;
                return (
                  <button
                    key={prof.id}
                    onClick={() => setSelectedProfession(prof)}
                    style={{
                      padding: '12px 14px',
                      background: isSelected ? '#1a1a1a' : 'transparent',
                      border: isSelected ? '1px solid #8b5cf6' : '1px solid #262626',
                      borderRadius: 8,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#363636';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#262626';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{prof.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5' }}>
                          {prof.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>
                          {prof.description}
                        </div>
                        {prof.estimated_avg_deal && (
                          <div style={{ fontSize: 11, color: '#8b5cf6', marginTop: 4 }}>
                            Avg. deal: ${prof.estimated_avg_deal.toLocaleString()} • {prof.active_brands} brands
                          </div>
                        )}
                      </div>
                      {prof.trending && (
                        <div style={{
                          background: '#f59e0b',
                          color: '#000',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}>
                          🔥 TRENDING
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom panel with details + action */}
      {selectedProfession && (
        <div style={{
          background: '#1a1a1a',
          borderTop: '1px solid #262626',
          padding: '16px',
          animation: 'slideUp 0.3s ease-out',
        }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {selectedProfession.icon} {selectedProfession.name}
            </div>
            <p style={{ fontSize: 13, color: '#a8a8a8', lineHeight: 1.5 }}>
              {selectedProfession.description}
            </p>
          </div>

          <Link href="/store" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
            <button
              onClick={() => {
                localStorage.setItem('valueskins_profession', selectedProfession.id);
              }}
              style={{
                width: '100%',
                padding: '12px 0',
                background: `linear-gradient(135deg, ${selectedProfession.gradientFrom}, ${selectedProfession.gradientTo})`,
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Select & Continue
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

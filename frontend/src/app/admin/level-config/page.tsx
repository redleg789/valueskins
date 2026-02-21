'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLevelConfig, useReputationConfig } from '@/lib/useConfigStorage';

const DEFAULT_LEVELS = {
  1: {
    name: 'Newcomer',
    followers: 0,
    engagement: 0,
    dealValue: 0,
  },
  2: {
    name: 'Rising Creator',
    followers: 10000,
    engagement: 2,
    dealValue: 500,
  },
  3: {
    name: 'Established Creator',
    followers: 50000,
    engagement: 3.5,
    dealValue: 5000,
  },
  4: {
    name: 'Top Tier Creator',
    followers: 250000,
    engagement: 5,
    dealValue: 25000,
  },
  5: {
    name: 'Elite Creator',
    followers: 1000000,
    engagement: 7,
    dealValue: 100000,
  },
};

export default function LevelConfigPage() {
  // Load from storage hooks
  const { levels: storedLevels, updateLevels, isLoaded: levelsLoaded } = useLevelConfig();
  const { factors: storedFactors, updateFactors, isLoaded: factorsLoaded } = useReputationConfig();

  const [levels, setLevels] = useState(storedLevels);
  const [reputationFactors, setReputationFactors] = useState(storedFactors);

  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editingFactor, setEditingFactor] = useState<number | null>(null);

  // Sync with storage when loaded
  useEffect(() => {
    if (levelsLoaded) setLevels(storedLevels);
  }, [levelsLoaded, storedLevels]);

  useEffect(() => {
    if (factorsLoaded) setReputationFactors(storedFactors);
  }, [factorsLoaded, storedFactors]);

  const updateLevelValue = (level: number, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updated = {
      ...levels,
      [level]: {
        ...levels[level as keyof typeof levels],
        [field]: numValue,
      }
    };
    setLevels(updated);
    updateLevels(updated);
  };

  const updateFactorValue = (index: number, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updatedFactors = [...reputationFactors];
    updatedFactors[index] = {
      ...updatedFactors[index],
      [field]: numValue,
    };
    setReputationFactors(updatedFactors);
    updateFactors(updatedFactors);
  };

  const resetToDefaults = () => {
    updateLevels(DEFAULT_LEVELS);
    setLevels(DEFAULT_LEVELS);
    alert('Reset to default level thresholds');
  };

  const totalWeight = reputationFactors.reduce((sum, f) => sum + f.weight, 0);
  const totalPoints = reputationFactors.reduce((sum, f) => sum + f.maxPoints, 0);

  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#8b5cf6', fontSize: '14px', marginBottom: '16px', display: 'inline-block' }}>
            ← Back to Home
          </Link>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '12px', margin: '16px 0 12px 0' }}>
            Level Configuration
          </h1>
          <p style={{ color: '#8e8e8e', fontSize: '16px' }}>
            Customize the factors and thresholds that determine creator levels
          </p>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* LEFT: LEVEL THRESHOLDS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Level Thresholds
              </h2>
              <button
                onClick={resetToDefaults}
                style={{
                  background: '#666',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                Reset to Defaults
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(levels).map(([levelNum, levelData]) => (
                <div
                  key={levelNum}
                  onClick={() => setEditingLevel(parseInt(levelNum) === editingLevel ? null : parseInt(levelNum))}
                  style={{
                    background: parseInt(levelNum) === editingLevel ? '#1c1c1e' : '#0a0a0a',
                    border: parseInt(levelNum) === editingLevel ? '1px solid #8b5cf6' : '1px solid #262626',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                        Level {levelNum}
                      </div>
                      <div style={{ color: '#8e8e8e', fontSize: '14px' }}>
                        {levelData.name}
                      </div>
                    </div>
                    <div style={{ fontSize: '20px' }}>
                      {parseInt(levelNum) === editingLevel ? '−' : '+'}
                    </div>
                  </div>

                  {parseInt(levelNum) === editingLevel && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #262626' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                          Level Name
                        </label>
                        <input
                          type="text"
                          value={levelData.name}
                          onChange={(e) => setLevels(prev => ({
                            ...prev,
                            [levelNum]: { ...prev[Number(levelNum) as keyof typeof prev], name: e.target.value }
                          }))}
                          style={{
                            width: '100%',
                            background: '#0a0a0a',
                            border: '1px solid #262626',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '8px 12px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                          Min Followers
                        </label>
                        <input
                          type="number"
                          value={levelData.followers}
                          onChange={(e) => updateLevelValue(parseInt(levelNum), 'followers', e.target.value)}
                          style={{
                            width: '100%',
                            background: '#0a0a0a',
                            border: '1px solid #262626',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '8px 12px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                          Min Engagement Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={levelData.engagement}
                          onChange={(e) => updateLevelValue(parseInt(levelNum), 'engagement', e.target.value)}
                          style={{
                            width: '100%',
                            background: '#0a0a0a',
                            border: '1px solid #262626',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '8px 12px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                          Min Deal Value ($)
                        </label>
                        <input
                          type="number"
                          value={levelData.dealValue}
                          onChange={(e) => updateLevelValue(parseInt(levelNum), 'dealValue', e.target.value)}
                          style={{
                            width: '100%',
                            background: '#0a0a0a',
                            border: '1px solid #262626',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '8px 12px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Save Info */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginTop: '20px',
              fontSize: '13px',
              color: '#a78bfa',
            }}>
              Changes are saved automatically. Refresh the platform pages to see updates.
            </div>

            {/* Quick Links */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #262626' }}>
              <div style={{ fontSize: '12px', color: '#8e8e8e', marginBottom: '12px' }}>Quick Links:</div>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <Link href="/demo/instagram" style={{ textDecoration: 'none', color: '#8b5cf6', fontSize: '14px' }}>
                  → Test on Instagram
                </Link>
                <Link href="/demo/linkedin" style={{ textDecoration: 'none', color: '#8b5cf6', fontSize: '14px' }}>
                  → Test on LinkedIn
                </Link>
                <Link href="/demo/youtube" style={{ textDecoration: 'none', color: '#8b5cf6', fontSize: '14px' }}>
                  → Test on YouTube
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: REPUTATION FACTORS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Reputation Factors
              </h2>
              <div style={{ background: totalWeight === 100 ? '#10b981' : '#ef4444', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                {totalWeight}% Total
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reputationFactors.map((factor, index) => (
                <div
                  key={index}
                  onClick={() => setEditingFactor(index === editingFactor ? null : index)}
                  style={{
                    background: index === editingFactor ? '#1c1c1e' : '#0a0a0a',
                    border: index === editingFactor ? '1px solid #8b5cf6' : '1px solid #262626',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {factor.name}
                      </div>
                      <div style={{ color: '#8e8e8e', fontSize: '13px' }}>
                        {factor.weight}% weight • max {factor.maxPoints} points
                      </div>
                    </div>
                    <div style={{ fontSize: '20px' }}>
                      {index === editingFactor ? '−' : '+'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    height: '4px',
                    background: '#262626',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${factor.weight}%`,
                      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                    }} />
                  </div>

                  {index === editingFactor && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #262626' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                          Factor Name
                        </label>
                        <input
                          type="text"
                          value={factor.name}
                          onChange={(e) => updateFactorValue(index, 'name', e.target.value)}
                          style={{
                            width: '100%',
                            background: '#0a0a0a',
                            border: '1px solid #262626',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '8px 12px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                          Weight (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={factor.weight}
                          onChange={(e) => updateFactorValue(index, 'weight', e.target.value)}
                          style={{
                            width: '100%',
                            background: '#0a0a0a',
                            border: '1px solid #262626',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '8px 12px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                          Max Points
                        </label>
                        <input
                          type="number"
                          value={factor.maxPoints}
                          onChange={(e) => updateFactorValue(index, 'maxPoints', e.target.value)}
                          style={{
                            width: '100%',
                            background: '#0a0a0a',
                            border: '1px solid #262626',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '8px 12px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{
              background: '#1c1c1e',
              border: '1px solid #262626',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '20px',
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#8e8e8e', marginBottom: '4px' }}>Weight Total</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: totalWeight === 100 ? '#10b981' : '#ef4444' }}>
                  {totalWeight}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#8e8e8e', marginBottom: '4px' }}>Total Max Score</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                  {totalPoints} points
                </div>
              </div>
              {totalWeight !== 100 && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#fca5a5',
                }}>
                  Warning: Total weight should equal 100%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        <div style={{
          marginTop: '60px',
          padding: '24px',
          background: '#1c1c1e',
          borderRadius: '12px',
          border: '1px solid #262626',
          marginBottom: '20px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', marginTop: 0 }}>
            How to Customize
          </h3>
          <div style={{ color: '#8e8e8e', lineHeight: '1.8', fontSize: '14px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Level Thresholds</div>
              <ul style={{ margin: '0 0 0 20px', paddingLeft: 0 }}>
                <li>Click any level to expand and adjust thresholds</li>
                <li><strong>Level Name:</strong> Customize what each level is called</li>
                <li><strong>Min Followers:</strong> Required follower count to reach this level</li>
                <li><strong>Min Engagement Rate:</strong> Required engagement percentage</li>
                <li><strong>Min Deal Value:</strong> Required average deal/partnership value</li>
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Reputation Factors</div>
              <ul style={{ margin: '0 0 0 20px', paddingLeft: 0 }}>
                <li>Click any factor to expand and adjust</li>
                <li><strong>Factor Name:</strong> Customize what the factor is called</li>
                <li><strong>Weight (%):</strong> How much this factor contributes (should total 100%)</li>
                <li><strong>Max Points:</strong> Maximum points possible for this factor (e.g., 250, 200, etc.)</li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Testing Your Changes</div>
              <ul style={{ margin: '0 0 0 20px', paddingLeft: 0 }}>
                <li>All changes save automatically to your browser</li>
                <li>Use the quick links below to test on each platform</li>
                <li>Edit creator metrics to see levels change based on your thresholds</li>
                <li>Total weight must equal 100% for accurate reputation scores</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Test Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginTop: '20px',
        }}>
          <Link href="/demo/instagram" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%)',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}>
              Test on Instagram
            </div>
          </Link>
          <Link href="/demo/linkedin" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0077b5 0%, #00a0df 100%)',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}>
              Test on LinkedIn
            </div>
          </Link>
          <Link href="/demo/youtube" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ff0000 0%, #ff6b00 100%)',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}>
              Test on YouTube
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

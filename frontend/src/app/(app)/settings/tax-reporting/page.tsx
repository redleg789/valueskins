'use client';

import { useState, useEffect } from 'react';

/**
 * TAX REPORTING & COMPLIANCE
 * Track earnings, generate 1099s, and manage tax compliance
 */

export default function TaxReportingPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [taxData, setTaxData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    setTaxData({
      year: 2024,
      total_earnings_cents: 125000,
      total_deals: 12,
      total_paid_cents: 125000,
      pending_cents: 0,
      expenses: {
        equipment_cents: 15000,
        software_cents: 5000,
        other_cents: 2000,
      },
      net_income_cents: 103000,
      tax_documents: [
        {
          id: 1,
          type: '1099-NEC',
          issuer: 'ValueSkins Inc',
          amount_cents: 125000,
          issued_at: '2025-01-31T00:00:00Z',
          file_url: 'https://example.com/1099-2024.pdf',
        },
      ],
    });
  }, [year]);

  const handleDownload1099 = (docId: number) => {
    // API call to download document
    alert('Downloading 1099-NEC...');
  };

  const handleExportStatement = (format: 'csv' | 'pdf') => {
    // API call to export statement
    alert(`Exporting earnings statement as ${format.toUpperCase()}...`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>📊 Tax Reporting & Compliance</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
            Track your earnings, manage expenses, and download tax documents
          </p>
        </div>

        {/* Year Selector */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setYear(year - 1)}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            ← Previous Year
          </button>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, minWidth: '100px', textAlign: 'center' }}>
            {year}
          </div>
          <button
            onClick={() => setYear(year + 1)}
            disabled={year >= new Date().getFullYear()}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
              cursor: year >= new Date().getFullYear() ? 'not-allowed' : 'pointer',
              opacity: year >= new Date().getFullYear() ? 0.5 : 1,
            }}
          >
            Next Year →
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>
            Loading tax data...
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              {[
                {
                  label: 'Total Earnings',
                  value: `$${(taxData.total_earnings_cents / 100).toLocaleString()}`,
                  color: '#10b981',
                },
                {
                  label: 'Total Deals',
                  value: taxData.total_deals,
                  color: '#3b82f6',
                },
                {
                  label: 'Paid',
                  value: `$${(taxData.total_paid_cents / 100).toLocaleString()}`,
                  color: '#22c55e',
                },
                {
                  label: 'Pending',
                  value: `$${(taxData.pending_cents / 100).toLocaleString()}`,
                  color: '#f59e0b',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: card.color }}>
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Expenses & Net Income */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '2rem',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Deductions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {Object.entries(taxData.expenses).map(([key, value]: [string, any]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa', textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span>${(value / 100).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
              }}>
                <span>Total Deductions</span>
                <span>${(Object.values(taxData.expenses as any).reduce((a, b: any) => a + b, 0) / 100).toLocaleString()}</span>
              </div>
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(139,92,246,0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                color: '#8b5cf6',
                fontSize: '1.1rem',
              }}>
                <span>Net Income (Taxable)</span>
                <span>${(taxData.net_income_cents / 100).toLocaleString()}</span>
              </div>
            </div>

            {/* Tax Documents */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '2rem',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Tax Documents</h3>

              {taxData.tax_documents.length === 0 ? (
                <div style={{
                  padding: '2rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#a1a1aa',
                }}>
                  📄 No tax documents available yet. They'll be generated by January 31st.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {taxData.tax_documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{doc.type}</div>
                        <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '0.25rem' }}>
                          {doc.issuer} • ${(doc.amount_cents / 100).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '0.25rem' }}>
                          Issued {new Date(doc.issued_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload1099(doc.id)}
                        style={{
                          padding: '0.5rem 1.5rem',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        📥 Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export Options */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '12px',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Export Reports</h3>
              <p style={{ color: '#a1a1aa', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Download your earnings statement for your accountant or tax filing
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => handleExportStatement('csv')}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  📊 Export as CSV
                </button>
                <button
                  onClick={() => handleExportStatement('pdf')}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  📄 Export as PDF
                </button>
              </div>
            </div>

            {/* Tax Tips */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '12px',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>💡 Tax Tips for Creators</h3>
              <ul style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.8 }}>
                <li>✓ Keep records of all deal contracts and deliverables</li>
                <li>✓ Track equipment and software expenses throughout the year</li>
                <li>✓ Consult a tax professional about estimated quarterly payments</li>
                <li>✓ Consider forming an LLC or S-corp for tax optimization</li>
                <li>✓ ValueSkins automatically tracks earnings for your convenience</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

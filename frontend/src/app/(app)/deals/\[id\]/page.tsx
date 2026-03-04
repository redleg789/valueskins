'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PlatformLayout from '@/components/PlatformLayout';
import { usePlatform } from '@/lib/context';
import { api } from '@/lib/api';

/**
 * DEAL ROOM NEGOTIATION INTERFACE
 *
 * This is where ALL deal conversations happen (not DMs).
 * Features:
 * - Offer/counter-offer history (immutable)
 * - Contract generation & e-signing (both parties)
 * - Deliverable upload with SHA-256 integrity
 * - Escrow stage progress tracker
 * - Credit advance requests
 * - Official dispute evidence export
 */

type Tab = 'messages' | 'offers' | 'contract' | 'deliverables' | 'details';

export default function DealRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { activePlatform } = usePlatform();
  const dealId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deal room state
  const [deal, setDeal] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [contract, setContract] = useState<any>(null);
  const [deliverables, setDeliverables] = useState<any[]>([]);

  // UI state
  const [messageText, setMessageText] = useState('');
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [uploadingDeliverable, setUploadingDeliverable] = useState(false);
  const [generatingContract, setGeneratingContract] = useState(false);

  useEffect(() => {
    const loadDeal = async () => {
      setLoading(true);
      try {
        const dealRes = await api.marketplace.getDealRoom(parseInt(dealId));
        if (dealRes.error) throw new Error(dealRes.error);
        setDeal(dealRes.data);

        // Load messages (immutable audit trail)
        const msgsRes = await api.deals.getMessages(parseInt(dealId));
        if (msgsRes.data) setMessages(msgsRes.data.messages);

        // Load offer history
        const offersRes = await api.deals.getOffers(parseInt(dealId));
        if (offersRes.data) setOffers(offersRes.data.offers);

        // Load contract if exists
        const contractRes = await api.deals.getContract(parseInt(dealId));
        if (contractRes.data) setContract(contractRes.data);

        // Load deliverables
        const delRes = await api.deals.getDeliverables(parseInt(dealId));
        if (delRes.data) setDeliverables(delRes.data.deliverables);
      } catch (err: any) {
        setError(err.message || 'Failed to load deal room');
      } finally {
        setLoading(false);
      }
    };

    loadDeal();
  }, [dealId]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim()) return;
    try {
      const res = await api.deals.sendMessage(parseInt(dealId), messageText);
      if (res.error) throw new Error(res.error);
      setMessageText('');
      // Refresh messages
      const msgsRes = await api.deals.getMessages(parseInt(dealId));
      if (msgsRes.data) setMessages(msgsRes.data.messages);
    } catch (err: any) {
      alert('Failed to send message: ' + err.message);
    }
  }, [dealId, messageText]);

  const handleCounterOffer = useCallback(async () => {
    if (!counterOfferAmount) return;
    try {
      const res = await api.deals.makeOffer(parseInt(dealId), parseInt(counterOfferAmount) * 100);
      if (res.error) throw new Error(res.error);
      setCounterOfferAmount('');
      // Refresh offers
      const offersRes = await api.deals.getOffers(parseInt(dealId));
      if (offersRes.data) setOffers(offersRes.data.offers);
    } catch (err: any) {
      alert('Failed to make offer: ' + err.message);
    }
  }, [dealId, counterOfferAmount]);

  const handleGenerateContract = useCallback(async () => {
    setGeneratingContract(true);
    try {
      const res = await api.deals.generateContract(parseInt(dealId));
      if (res.error) throw new Error(res.error);
      setContract(res.data);
    } catch (err: any) {
      alert('Failed to generate contract: ' + err.message);
    } finally {
      setGeneratingContract(false);
    }
  }, [dealId]);

  const handleSignContract = useCallback(async () => {
    try {
      const res = await api.deals.signContract(parseInt(dealId), contract.id);
      if (res.error) throw new Error(res.error);
      alert('Contract signed successfully');
      const contractRes = await api.deals.getContract(parseInt(dealId));
      if (contractRes.data) setContract(contractRes.data);
    } catch (err: any) {
      alert('Failed to sign contract: ' + err.message);
    }
  }, [dealId, contract]);

  const handleUploadDeliverable = useCallback(async (file: File) => {
    setUploadingDeliverable(true);
    try {
      const res = await api.deals.uploadDeliverable(parseInt(dealId), file);
      if (res.error) throw new Error(res.error);
      // Refresh deliverables
      const delRes = await api.deals.getDeliverables(parseInt(dealId));
      if (delRes.data) setDeliverables(delRes.data.deliverables);
    } catch (err: any) {
      alert('Failed to upload deliverable: ' + err.message);
    } finally {
      setUploadingDeliverable(false);
    }
  }, [dealId]);

  const handleExportEvidence = useCallback(async () => {
    try {
      const res = await api.deals.exportEvidenceBundle(parseInt(dealId));
      if (res.error) throw new Error(res.error);
      // Download zip file
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `deal-${dealId}-evidence.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      alert('Failed to export evidence: ' + err.message);
    }
  }, [dealId]);

  if (loading) {
    return <PlatformLayout title="Deal Room"><div style={{ padding: 20 }}>Loading deal room...</div></PlatformLayout>;
  }

  if (error) {
    return <PlatformLayout title="Deal Room"><div style={{ padding: 20, color: 'red' }}>{error}</div></PlatformLayout>;
  }

  return (
    <PlatformLayout title={`Deal with ${deal?.brand_name}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, padding: 16 }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--ig-separator)' }}>
            {(['messages', 'offers', 'contract', 'deliverables', 'details'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 16px',
                  background: activeTab === tab ? 'var(--ig-blue)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--ig-text-secondary)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: activeTab === tab ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '60vh', overflow: 'auto' }}>
              <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 14, border: '1px solid var(--ig-separator)' }}>
                <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 8 }}>
                  💬 All conversations are recorded here (not in DMs). This is your official dispute record.
                </div>
              </div>

              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--ig-card)',
                    borderRadius: 12,
                    padding: 14,
                    border: '1px solid var(--ig-separator)',
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 6 }}>
                    {msg.sender_name} • {new Date(msg.server_timestamp).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--ig-text-primary)' }}>{msg.content}</div>
                </div>
              ))}

              {/* Message Input */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Send a message..."
                  style={{
                    flex: 1,
                    padding: 12,
                    background: 'var(--ig-card)',
                    border: '1px solid var(--ig-separator)',
                    borderRadius: 8,
                    fontSize: 14,
                    color: 'var(--ig-text-primary)',
                    resize: 'none',
                    height: 80,
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  style={{
                    padding: '12px 20px',
                    background: messageText.trim() ? 'var(--ig-blue)' : 'var(--ig-separator)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 14, border: '1px solid var(--ig-separator)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Offer History</div>
                {offers.map((offer, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: i < offers.length - 1 ? '1px solid var(--ig-separator)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)' }}>
                        {offer.made_by === 'brand' ? 'Brand' : 'You'} • {new Date(offer.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ig-blue)' }}>
                        ${(offer.amount_cents / 100).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ig-text-secondary)' }}>{offer.note}</div>
                    {offer.response && (
                      <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)', marginTop: 6 }}>
                        Response: {offer.response}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Counter Offer */}
              {deal?.status === 'active' && (
                <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 14, border: '1px solid var(--ig-separator)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Make a Counter-Offer</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      value={counterOfferAmount}
                      onChange={(e) => setCounterOfferAmount(e.target.value)}
                      placeholder="Amount in USD"
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        background: 'var(--ig-elevated)',
                        border: '1px solid var(--ig-separator)',
                        borderRadius: 8,
                        fontSize: 14,
                        color: 'var(--ig-text-primary)',
                      }}
                    />
                    <button
                      onClick={handleCounterOffer}
                      disabled={!counterOfferAmount}
                      style={{
                        padding: '10px 16px',
                        background: counterOfferAmount ? 'var(--ig-blue)' : 'var(--ig-separator)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: counterOfferAmount ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contract Tab */}
          {activeTab === 'contract' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {!contract ? (
                <button
                  onClick={handleGenerateContract}
                  disabled={generatingContract}
                  style={{
                    padding: '16px',
                    background: 'var(--ig-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {generatingContract ? 'Generating...' : 'Generate Contract'}
                </button>
              ) : (
                <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 16, border: '1px solid var(--ig-separator)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Contract Preview</div>
                  <div style={{ fontSize: 13, color: 'var(--ig-text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                    {contract.contract_content}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div style={{ background: 'var(--ig-elevated)', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Brand Signature</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: contract.brand_signed_at ? 'var(--ig-blue)' : 'var(--ig-text-tertiary)' }}>
                        {contract.brand_signed_at ? '✓ Signed' : 'Pending'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--ig-elevated)', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--ig-text-tertiary)' }}>Your Signature</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: contract.creator_signed_at ? 'var(--ig-blue)' : 'var(--ig-text-tertiary)' }}>
                        {contract.creator_signed_at ? '✓ Signed' : 'Pending'}
                      </div>
                    </div>
                  </div>
                  {!contract.creator_signed_at && (
                    <button
                      onClick={handleSignContract}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--ig-blue)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Sign Contract
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Deliverables Tab */}
          {activeTab === 'deliverables' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Payment Verification Required (ANTI-SCAM) */}
              {deal?.advance_required && !deal?.advance_payment_verified && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>
                    🔒 Content Upload Blocked Until Payment Verified
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ig-text-secondary)', lineHeight: 1.6 }}>
                    <strong>Contract requires {deal.advance_percentage}% advance payment before deliverables.</strong>
                    <br/><br/>
                    <strong>Once you receive payment:</strong>
                    <ol style={{ marginLeft: 16, marginTop: 8 }}>
                      <li>Click "Verify Payment Received" in Details tab</li>
                      <li>Upload proof (bank screenshot, transaction ID)</li>
                      <li>System unlocks content upload here</li>
                    </ol>
                    <br/>
                    This protects creators. Content cannot be uploaded until payment is verified by you.
                  </div>
                </div>
              )}

              {/* Upload Section (gated by payment) */}
              {!deal?.advance_required || deal?.advance_payment_verified ? (
                <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 16, border: '1px solid var(--ig-separator)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Upload Deliverables</div>
                  <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 12, background: 'var(--ig-elevated)', padding: 10, borderRadius: 8 }}>
                    ✓ Max revisions allowed: <strong>{deal?.revision_cap || 2}</strong> (extras charged separately)
                  </div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadDeliverable(file);
                    }}
                    disabled={uploadingDeliverable}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--ig-elevated)',
                      border: '2px dashed var(--ig-separator)',
                      borderRadius: 8,
                      cursor: uploadingDeliverable ? 'not-allowed' : 'pointer',
                      opacity: uploadingDeliverable ? 0.5 : 1,
                    }}
                  />
                  <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 8 }}>
                    File integrity verified via SHA-256 hash. All deliverables documented immutably.
                  </div>
                </div>
              ) : null}

              {deliverables.length > 0 && (
                <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 16, border: '1px solid var(--ig-separator)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Uploaded Deliverables</div>
                  {deliverables.map((del, i) => (
                    <div key={i} style={{ padding: '10px 0', borderBottom: i < deliverables.length - 1 ? '1px solid var(--ig-separator)' : 'none' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{del.deliverable_type}</div>
                      <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginTop: 4 }}>
                        Hash: {del.content_hash?.substring(0, 16)}...
                      </div>
                      {del.accepted_by_brand && (
                        <div style={{ fontSize: 12, color: 'var(--ig-blue)', marginTop: 4 }}>✓ Approved</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 16, border: '1px solid var(--ig-separator)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Escrow Progress</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['advance', 'milestone', 'completion'].map(stage => (
                    <div key={stage} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', marginBottom: 8 }}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </div>
                      <div style={{ height: 8, background: 'var(--ig-separator)', borderRadius: 4, marginBottom: 6 }} />
                      <div style={{ fontSize: 11, color: 'var(--ig-text-secondary)' }}>Pending</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 16, border: '1px solid var(--ig-separator)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Deal Information</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ig-text-secondary)' }}>Status:</span>
                    <span style={{ fontWeight: 600 }}>{deal?.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ig-text-secondary)' }}>Created:</span>
                    <span style={{ fontWeight: 600 }}>{new Date(deal?.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ig-text-secondary)' }}>Expires:</span>
                    <span style={{ fontWeight: 600 }}>{new Date(deal?.expires_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Verification (ANTI-SCAM) */}
              {deal?.advance_required && (
                <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 16, border: '1px solid var(--ig-separator)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>💰 Payment Verification</div>
                  <div style={{ fontSize: 12, color: 'var(--ig-text-secondary)', marginBottom: 12 }}>
                    Once you receive the {deal.advance_percentage}% advance payment, verify it here. This unlocks content upload.
                  </div>
                  {!deal?.advance_payment_verified ? (
                    <button
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: 12,
                      }}
                    >
                      ✓ Verify Payment Received
                    </button>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', padding: 10, background: 'rgba(16,185,129,0.1)', borderRadius: 8, marginBottom: 12 }}>
                      ✓ Payment verified on {deal.advance_payment_verified_at}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleExportEvidence}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--ig-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                📥 Export Evidence Bundle (All Messages, Offers, Contract, Deliverables, Payment Proof)
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 14, border: '1px solid var(--ig-separator)' }}>
            <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', fontWeight: 600, marginBottom: 8 }}>STATUS</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ig-blue)' }}>{deal?.status?.toUpperCase()}</div>
          </div>

          <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 14, border: '1px solid var(--ig-separator)' }}>
            <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', fontWeight: 600, marginBottom: 8 }}>DEADLINE</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(deal?.expires_at).toLocaleDateString()}</div>
          </div>

          <div style={{ background: 'var(--ig-card)', borderRadius: 12, padding: 14, border: '1px solid var(--ig-separator)' }}>
            <div style={{ fontSize: 12, color: 'var(--ig-text-tertiary)', fontWeight: 600, marginBottom: 8 }}>ADVANCE PREFERENCE</div>
            <div style={{ fontSize: 13 }}>
              {deal?.advance_compatible ? '✓ Compatible' : '✗ Incompatible'}
            </div>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}

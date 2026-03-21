'use client';

import React, { useState } from 'react';

export interface ScriptVersion {
  version: number;
  text: string;
  editedBy: 'creator' | 'brand';
  editedAt: string;
  reason?: string;
}

export interface ColorScheme {
  primary: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
}

interface ScriptNegotiationUIProps {
  colors: ColorScheme;
  scriptDraft: string;
  scriptMode: 'non_negotiable' | 'discussion' | 'creator_freedom';
  brandScriptText?: string;
  scriptVersion: number;
  scriptStatus: 'draft' | 'submitted' | 'pending_revision' | 'approved';
  creatorScriptApproved: boolean;
  brandScriptApproved: boolean;
  scriptVersionHistory: ScriptVersion[];
  currentRole: 'creator' | 'brand';
  onScriptChange: (newText: string, reason?: string) => void;
  onApproveScript: () => void;
  onRevokeApproval: () => void;
  onNotify: (recipient: string, type: 'campaign' | 'application' | 'message', message: string) => Promise<void>;
}

export const ScriptNegotiationUI: React.FC<ScriptNegotiationUIProps> = ({
  colors: C,
  scriptDraft,
  scriptMode,
  brandScriptText,
  scriptVersion,
  scriptStatus,
  creatorScriptApproved,
  brandScriptApproved,
  scriptVersionHistory,
  currentRole,
  onScriptChange,
  onApproveScript,
  onRevokeApproval,
  onNotify,
}) => {
  const [showExpandedEditor, setShowExpandedEditor] = useState(false);
  const [editorText, setEditorText] = useState(scriptDraft);
  const [editReason, setEditReason] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number | null>(null);

  const charCount = editorText.length;
  const lineCount = editorText.split('\n').length;

  const handleSaveEdits = () => {
    if (editorText.trim().length < 20) {
      alert('Script must be at least 20 characters');
      return;
    }
    onScriptChange(editorText, editReason);
    setShowExpandedEditor(false);
    setEditReason('');
  };

  const handleCancelEdits = () => {
    setEditorText(scriptDraft);
    setEditReason('');
    setShowExpandedEditor(false);
  };

  const getApproversStatus = () => {
    const creatorStatus = creatorScriptApproved ? 'Approved' : 'Pending';
    const brandStatus = brandScriptApproved ? 'Approved' : 'Pending';
    return { creatorStatus, brandStatus };
  };

  const getStatusBadge = () => {
    if (scriptStatus === 'approved') {
      return { text: 'Both approved', color: C.success };
    }
    if (creatorScriptApproved && !brandScriptApproved) {
      return { text: 'Creator approved, awaiting brand', color: C.warning };
    }
    if (brandScriptApproved && !creatorScriptApproved) {
      return { text: 'Brand approved, awaiting creator', color: C.warning };
    }
    return { text: 'Draft', color: C.text };
  };

  const badge = getStatusBadge();
  const approvers = getApproversStatus();

  const isReadOnly = scriptMode === 'non_negotiable';
  const displayText = isReadOnly ? brandScriptText || scriptDraft : scriptDraft;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Script header with status badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setShowExpandedEditor(true)}
          style={{
            flex: 1,
            background: 'none',
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '12px',
            fontWeight: 700,
            color: C.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Script Editor</span>
          <span style={{ fontSize: '10px' }}>▲</span>
        </button>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: badge.color,
            padding: '4px 8px',
            borderRadius: '4px',
            background: `${badge.color}20`,
            whiteSpace: 'nowrap',
          }}
        >
          {badge.text}
        </div>
      </div>

      {/* Script content preview */}
      <div
        style={{
          background: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          borderRadius: '6px',
          padding: '8px',
          fontSize: '11px',
          color: C.text,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.5,
          maxHeight: '120px',
          overflow: 'auto',
        }}
      >
        {displayText || <span style={{ color: C.textMuted }}>No script yet...</span>}
      </div>

      {/* Approval status */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '8px',
          background: C.bg,
          borderRadius: '6px',
          border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, color: C.text }}>Script Approvals</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Creator approval */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: C.text,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: creatorScriptApproved ? C.success : C.border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              {creatorScriptApproved ? '✓' : '○'}
            </div>
            <span>
              {creatorScriptApproved
                ? 'You approved at ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                : 'You have not approved'}
            </span>
          </div>

          {/* Brand approval */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: C.text,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: brandScriptApproved ? C.success : C.border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              {brandScriptApproved ? '✓' : '○'}
            </div>
            <span>
              {brandScriptApproved
                ? 'Brand approved at ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                : 'Brand awaiting approval'}
            </span>
          </div>
        </div>

        {/* Approval buttons */}
        {!isReadOnly && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {!creatorScriptApproved && currentRole === 'creator' && (
              <button
                onClick={() => {
                  onApproveScript();
                  onNotify('brand', 'application', 'Creator approved the script. Awaiting your approval to proceed to deliverables.');
                }}
                style={{
                  flex: 1,
                  background: C.primary,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                I Approve Script
              </button>
            )}
            {!brandScriptApproved && currentRole === 'brand' && (
              <button
                onClick={() => {
                  onApproveScript();
                  onNotify('creator', 'application', 'Brand approved the script. Awaiting your approval to proceed to deliverables.');
                }}
                style={{
                  flex: 1,
                  background: C.primary,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                I Approve Script
              </button>
            )}
            {((creatorScriptApproved && currentRole === 'creator') ||
              (brandScriptApproved && currentRole === 'brand')) && (
              <button
                onClick={() => {
                  onRevokeApproval();
                  const other = currentRole === 'creator' ? 'brand' : 'creator';
                  onNotify(other, 'application', `${currentRole === 'creator' ? 'Creator' : 'Brand'} revoked script approval.`);
                }}
                style={{
                  flex: 1,
                  background: 'none',
                  border: `1px solid ${C.warning}`,
                  borderRadius: '6px',
                  padding: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: C.warning,
                  cursor: 'pointer',
                }}
              >
                Revoke Approval
              </button>
            )}
          </div>
        )}
      </div>

      {/* Version history toggle */}
      {scriptVersionHistory && scriptVersionHistory.length > 0 && (
        <button
          onClick={() => setShowVersionHistory(!showVersionHistory)}
          style={{
            background: 'none',
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            padding: '6px',
            fontSize: '11px',
            fontWeight: 600,
            color: C.textSecondary,
            cursor: 'pointer',
          }}
        >
          Version History ({scriptVersionHistory.length}) {showVersionHistory ? '▲' : '▼'}
        </button>
      )}

      {/* Version history panel */}
      {showVersionHistory && scriptVersionHistory && scriptVersionHistory.length > 0 && (
        <div
          style={{
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            padding: '8px',
            maxHeight: '300px',
            overflow: 'auto',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>
            Version History
          </div>
          {scriptVersionHistory.map((v, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px',
                marginBottom: '8px',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: selectedVersionIndex === idx ? 1 : 0.7,
              }}
              onClick={() => setSelectedVersionIndex(selectedVersionIndex === idx ? null : idx)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: '4px',
                }}
              >
                <span>Version {v.version}</span>
                <span style={{ fontSize: '10px', color: C.textMuted }}>
                  {v.editedBy === 'creator' ? 'Creator' : 'Brand'}
                </span>
              </div>
              <div style={{ fontSize: '9px', color: C.textMuted, marginBottom: '4px' }}>
                {new Date(v.editedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
              {v.reason && (
                <div style={{ fontSize: '9px', color: C.textSecondary, marginBottom: '4px', fontStyle: 'italic' }}>
                  Reason: {v.reason}
                </div>
              )}
              {selectedVersionIndex === idx && (
                <div
                  style={{
                    fontSize: '10px',
                    color: C.text,
                    background: C.surfaceAlt,
                    padding: '6px',
                    borderRadius: '4px',
                    marginTop: '4px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.4,
                  }}
                >
                  {v.text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expanded editor modal */}
      {showExpandedEditor && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => handleCancelEdits()}
        >
          <div
            style={{
              background: C.surface,
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>Edit Script</div>

            {isReadOnly && (
              <div style={{ fontSize: '11px', color: C.warning, padding: '8px', background: `${C.warning}20`, borderRadius: '6px' }}>
                This script is non-negotiable. You can view it but cannot edit it.
              </div>
            )}

            <textarea
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              readOnly={isReadOnly}
              placeholder="Write your script here..."
              style={{
                width: '100%',
                minHeight: '300px',
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                borderRadius: '6px',
                padding: '12px',
                fontSize: '12px',
                color: C.text,
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.textMuted }}>
              <span>{charCount} characters</span>
              <span>{lineCount} lines</span>
            </div>

            {!isReadOnly && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>
                    Reason for change (optional)
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="e.g., Added disclaimer, Toned down tone"
                    style={{
                      width: '100%',
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: '11px',
                      color: C.text,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleSaveEdits}
                    disabled={editorText.trim().length < 20}
                    style={{
                      flex: 1,
                      background: editorText.trim().length >= 20 ? C.primary : C.border,
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#fff',
                      cursor: editorText.trim().length >= 20 ? 'pointer' : 'not-allowed',
                      opacity: editorText.trim().length >= 20 ? 1 : 0.5,
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdits}
                    style={{
                      flex: 1,
                      background: 'none',
                      border: `1px solid ${C.border}`,
                      borderRadius: '6px',
                      padding: '10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: C.text,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

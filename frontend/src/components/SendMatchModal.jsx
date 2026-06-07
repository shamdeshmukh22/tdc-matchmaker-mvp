import { useState } from 'react';
import { sendMatchProposal } from '../services/api';

export default function SendMatchModal({ show, match, client, aiReview, aiLoading, onClose, onConfirmSend, mode }) {
  const [sent, setSent] = useState(false);

  if (!show || !match) return null;

 const handleSend = async () => {
  try {
    setSent(true); // Immediate feedback to the user
    
    // Call the API and wait for confirmation
    await sendMatchProposal({
      sentBy: "Admin",
      clientId: client.id,
     clientName: `${client.firstName} ${client.lastName}`,
      matchId: match.id,
      matchName: `${match.firstName} ${match.lastName}`
    });
    
    // Success path
    setTimeout(() => { 
      setSent(false); 
      onClose(); 
    }, 1600);
  } catch (err) {
    setSent(false); // Reset state so the user can try again if it fails
    console.error("Failed to send proposal", err);
    alert("Could not send the match proposal. Please try again.");
  }
};

  return (
    <div className="tdc-modal-backdrop" onClick={onClose}>
      <div className="tdc-modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="tdc-modal-header">
          <span className="tdc-modal-title">
            {mode === 'ai'
              ? <><i className="bi bi-robot me-2"></i>AI Compatibility Review</>
              : <><i className="bi bi-send-fill me-2"></i>Send Match Invite</>}
          </span>
          <button className="tdc-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="tdc-modal-body">

          {/* Match Preview */}
          <div className="match-preview-card">
            <div style={{
              width:48, height:48, borderRadius:'50%',
              background:'linear-gradient(135deg,#c96b8a,#d4a55a)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:800, color:'#fff', fontSize:'1rem', flexShrink:0
            }}>
              {match.firstName?.[0]}{match.lastName?.[0]}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{match.firstName} {match.lastName}</div>
              <div style={{ fontSize:'0.8rem', color:'#9a9ab0' }}>
                {match.age} yrs · {match.profession} · {match.city}
              </div>
            </div>
            {match.compatibilityScore && (
              <span style={{
                background:'linear-gradient(135deg,#c96b8a,#d4a55a)',
                color:'#fff', fontWeight:800, fontSize:'0.78rem',
                padding:'0.25em 0.75em', borderRadius:20
              }}>
                {match.compatibilityScore}%
              </span>
            )}
          </div>

          {/* AI Mode */}
          {mode === 'ai' && (
            aiLoading ? (
              <div className="tdc-loader" style={{ flexDirection:'column', gap:'0.75rem' }}>
                <div className="tdc-spinner" style={{ width:36, height:36, borderWidth:3 }}></div>
                <span>Analysing compatibility with AI…</span>
              </div>
            ) : aiReview ? (
              <>
                <div className="ai-score-display">
                  <div className="ai-score-num">{aiReview.compatibilityScore}%</div>
                  <div className="ai-score-label">Compatibility Score</div>
                </div>
                <div className="ai-section-label"><i className="bi bi-stars me-1"></i>Why They're Compatible</div>
                <div className="ai-explanation">{aiReview.explanation}</div>
                <div className="ai-section-label"><i className="bi bi-envelope-heart me-1"></i>Icebreaker Email</div>
                <div className="ai-icebreaker">{aiReview.icebreaker}</div>
              </>
            ) : (
              <div className="tdc-loader" style={{ color:'#e05' }}>Failed to load AI review.</div>
            )
          )}

          {/* Send Confirm Mode */}
          {mode === 'send' && !sent && (
            <div style={{ textAlign:'center', padding:'1rem 0' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>💌</div>
              <p style={{ color:'#4a4a6a', fontSize:'0.92rem', lineHeight:1.7 }}>
                Send a match introduction to <strong>{client?.firstName}</strong> connecting them
                with <strong>{match.firstName} {match.lastName}</strong>?
              </p>
              <p style={{ color:'#9a9ab0', fontSize:'0.8rem' }}>A mock email notification will be triggered.</p>
            </div>
          )}

          {sent && (
            <div style={{ textAlign:'center', padding:'1.5rem 0', color:'#10b981' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem', animation:'pop 0.5s ease' }}>✅</div>
              <p style={{ fontWeight:600 }}>Match invite sent successfully!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div className="tdc-modal-footer">
            <button className="btn-modal-cancel" onClick={onClose}>
              {mode === 'ai' ? 'Close' : 'Cancel'}
            </button>
            {mode === 'send' && (
              <button className="btn-modal-send" onClick={handleSend}>
                <i className="bi bi-send-fill me-1"></i>Confirm & Send
              </button>
            )}
            {mode === 'ai' && aiReview && (
              <button className="btn-modal-send" onClick={handleSend}>
                <i className="bi bi-send-fill me-1"></i>Send This Match
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

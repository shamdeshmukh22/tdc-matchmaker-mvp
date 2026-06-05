export default function MatchFeed({ matches, loading, onSendMatch, onAIReview }) {
  if (loading) {
    return (
      <div className="tdc-loader" style={{ flexDirection:'column', gap:'0.75rem', padding:'3rem' }}>
        <div className="tdc-spinner" style={{ width:36, height:36, borderWidth:3 }}></div>
        <span>Finding best matches…</span>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="tdc-loader" style={{ padding:'2.5rem' }}>
        No match suggestions found.
      </div>
    );
  }

  return (
    <div>
      <div className="tdc-match-section-title">
        <i className="bi bi-lightning-charge-fill"></i>
        Algorithmic Match Suggestions
        <span style={{ marginLeft:6, color:'#9a9ab0', fontWeight:400, textTransform:'none', letterSpacing:0, fontSize:'0.8rem' }}>
          — {matches.length} profiles
        </span>
      </div>

      <div className="row g-3">
        {matches.map((match, i) => (
          <div className="col-xl-4 col-lg-6 col-md-6" key={match.id}>
            <div
              className="tdc-match-card"
              id={`match-card-${match.id}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Score badge */}
              <span className="match-score">{match.compatibilityScore}%</span>

              {/* Avatar + Name */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', marginBottom:'0.75rem' }}>
                <div style={{
                  width:42, height:42, borderRadius:'50%',
                  background:'linear-gradient(135deg,#c96b8a,#d4a55a)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#fff', fontWeight:700, fontSize:'0.9rem', flexShrink:0
                }}>
                  {match.firstName?.[0]}{match.lastName?.[0]}
                </div>
                <div>
                  <div className="match-name">{match.firstName} {match.lastName}</div>
                  <div className="match-meta">{match.age} yrs · {match.height} cm · {match.city}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="match-tags">
                <span className="match-tag">{match.profession}</span>
                <span className="match-tag">{match.religion}</span>
                <span className="match-tag">{match.diet}</span>
                <span className="match-tag">₹{match.income} LPA</span>
              </div>

              {/* Quick info */}
              <div style={{ fontSize:'0.75rem', color:'#9a9ab0', marginBottom:'0.85rem' }}>
                {[
                  ['Education',     match.education],
                  ['Family Values', match.familyValues],
                  ['Want Kids',     match.wantKids],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span>{lbl}</span>
                    <span style={{ color:'#4a4a6a', fontWeight:500 }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <button
                className="btn-send-match"
                id={`btn-send-${match.id}`}
                onClick={() => onSendMatch(match)}
              >
                <span><i className="bi bi-send-fill me-1"></i>Send Match</span>
              </button>
              <button
                className="btn-ai-review"
                id={`btn-ai-${match.id}`}
                onClick={() => onAIReview(match)}
              >
                <i className="bi bi-robot me-1"></i>AI Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

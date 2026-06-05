import { useState, useMemo } from 'react';

function statusBadge(status) {
  if (status === 'Onboarding')    return 'badge-status badge-onboarding';
  if (status === 'Active Search') return 'badge-status badge-active';
  if (status === 'Match Sent')    return 'badge-status badge-sent';
  return 'badge-status badge-onboarding';
}

export default function Sidebar({ customers, selectedId, onSelect, loading }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <aside className="tdc-sidebar">
      <div className="tdc-sidebar-header">
        <h2>
          <i className="bi bi-people-fill me-2" style={{ color: 'var(--rose)' }}></i>
          My Clients
          <span style={{ color:'var(--muted)', fontWeight:400, fontSize:'0.8rem', marginLeft:6 }}>
            ({customers.length})
          </span>
        </h2>
        <input
          type="text"
          className="tdc-search-input"
          id="sidebar-search"
          placeholder="🔍  Search by name, city, status…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="tdc-client-list">
        {loading ? (
          <div className="tdc-loader"><div className="tdc-spinner"></div>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="tdc-loader">No clients found</div>
        ) : (
          filtered.map((c, i) => (
            <div
              key={c.id}
              id={`client-card-${c.id}`}
              className={`tdc-client-card ${selectedId === c.id ? 'active' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => onSelect(c.id)}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#c96b8a,#d4a55a)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#fff', fontWeight:700, fontSize:'0.85rem', flexShrink:0
                }}>
                  {c.firstName[0]}{c.lastName[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="client-name">{c.firstName} {c.lastName}</div>
                  <div className="client-meta">
                    {c.age} yrs · {c.city} · {c.gender === 'Male' ? '♂' : '♀'}
                  </div>
                </div>
                <span className={statusBadge(c.status)}>{c.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

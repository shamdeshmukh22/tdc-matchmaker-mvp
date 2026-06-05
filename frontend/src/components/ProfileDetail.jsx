function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || '—'}</span>
    </div>
  );
}

function cmToFt(cm) {
  const totalIn = cm / 2.54;
  return `${Math.floor(totalIn / 12)}'${Math.round(totalIn % 12)}"`;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

export default function ProfileDetail({ customer }) {
  if (!customer) return null;
  const initials = `${customer.firstName[0]}${customer.lastName[0]}`;

  const statusCls =
    customer.status === 'Onboarding'    ? 'badge-status badge-onboarding' :
    customer.status === 'Active Search' ? 'badge-status badge-active'     :
                                          'badge-status badge-sent';

  return (
    <div style={{ animation: 'fadeUp 0.45s ease-out' }}>

      {/* Profile Header */}
      <div className="tdc-profile-header">
        <div style={{ display:'flex', alignItems:'flex-start', gap:'1.1rem', flexWrap:'wrap' }}>
          <div className="profile-avatar">{initials}</div>
          <div style={{ flex:1 }}>
            <h2 className="profile-name">{customer.firstName} {customer.lastName}</h2>
            <p className="profile-tagline">
              {customer.profession} at {customer.company} · {customer.city}
            </p>
          </div>
          <span className={statusCls}>{customer.status}</span>
        </div>
        {customer.bio && <p className="profile-bio">"{customer.bio}"</p>}
      </div>

      {/* Detail Cards */}
      <div className="row g-3">

        {/* Personal */}
        <div className="col-md-6">
          <div className="tdc-detail-card h-100">
            <div className="card-section-title"><i className="bi bi-person-lines-fill"></i>Personal Info</div>
            <DetailRow label="Full Name"      value={`${customer.firstName} ${customer.lastName}`} />
            <DetailRow label="Gender"         value={customer.gender} />
            <DetailRow label="Age"            value={`${customer.age} years`} />
            <DetailRow label="Date of Birth"  value={fmtDate(customer.dob)} />
            <DetailRow label="Height"         value={`${customer.height} cm (${cmToFt(customer.height)})`} />
            <DetailRow label="City"           value={customer.city} />
            <DetailRow label="Marital Status" value={customer.maritalStatus} />
            <DetailRow label="Languages"      value={(customer.languages||[]).join(', ')} />
            <DetailRow label="Siblings"       value={customer.siblings} />
          </div>
        </div>

        {/* Career */}
        <div className="col-md-6">
          <div className="tdc-detail-card h-100">
            <div className="card-section-title"><i className="bi bi-briefcase-fill"></i>Career & Income</div>
            <DetailRow label="Education"  value={customer.education} />
            <DetailRow label="College"    value={customer.college} />
            <DetailRow label="Profession" value={customer.profession} />
            <DetailRow label="Company"    value={customer.company} />
            <DetailRow label="Income"     value={`₹${customer.income} LPA`} />
          </div>
        </div>

        {/* Lifestyle */}
        <div className="col-md-6">
          <div className="tdc-detail-card h-100">
            <div className="card-section-title"><i className="bi bi-heart-fill"></i>Lifestyle & Values</div>
            <DetailRow label="Lifestyle"         value={customer.lifestyle} />
            <DetailRow label="Hobbies"           value={(customer.hobbies||[]).join(', ')} />
            <DetailRow label="Want Kids"         value={customer.wantKids} />
            <DetailRow label="Open to Relocate"  value={customer.openToRelocate} />
            <DetailRow label="Open to Pets"      value={customer.openToPets} />
            <DetailRow label="Family Values"     value={customer.familyValues} />
          </div>
        </div>

        {/* Cultural */}
        <div className="col-md-6">
          <div className="tdc-detail-card h-100">
            <div className="card-section-title"><i className="bi bi-stars"></i>Cultural & Matchmaking</div>
            <DetailRow label="Religion"           value={customer.religion} />
            <DetailRow label="Caste"              value={customer.caste} />
            <DetailRow label="Manglik"            value={customer.manglik} />
            <DetailRow label="Dietary Preference" value={customer.diet} />
            <DetailRow label="Family Values"      value={customer.familyValues} />
          </div>
        </div>
      </div>
    </div>
  );
}

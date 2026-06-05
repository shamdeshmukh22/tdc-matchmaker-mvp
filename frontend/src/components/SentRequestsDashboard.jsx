// Audit trail dashboard showing all sent match proposals
import { useState, useEffect } from 'react';
import '../styles/SentRequestsDashboard.css';

export default function SentRequestsDashboard() {
  // Component state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Load audit trail on mount
  useEffect(() => {
    fetchAuditTrail();
  }, []);

  const fetchAuditTrail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/matches/audit-trail');
      if (!response.ok) {
        throw new Error(`Failed to fetch audit trail: ${response.statusText}`);
      }
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Error fetching audit trail:', err);
      setError(err.message || 'Unable to load sent requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClasses = (status) => {
    // Color badges based on status
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap';
    
    switch (status) {
      case 'Awaiting Family Review':
        return `${baseClasses} bg-amber-100 text-amber-800 border border-amber-300`;
      case 'Accepted':
        return `${baseClasses} bg-emerald-100 text-emerald-800 border border-emerald-300`;
      case 'Rejected by Client':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-300`;
      case 'Rejected by Family':
        return `${baseClasses} bg-rose-100 text-rose-800 border border-rose-300`;
      case 'In Progress':
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-300`;
    }
  };

  const formatDate = (isoString) => {
    // Format ISO date to readable format like "Jun 02, 2:32 PM"
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Filter by status
  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests.filter(req => req.statusTag === filterStatus);

  // Get unique statuses for dropdown
  const uniqueStatuses = [...new Set(requests.map(req => req.statusTag))];

  // Loading spinner
  if (loading) {
    return (
      <div className="sent-requests-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading audit trail...</p>
        </div>
      </div>
    );
  }

  // Error message
  if (error) {
    return (
      <div className="sent-requests-container">
        <div className="error-banner">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <div>
            <strong>Error Loading Audit Trail</strong>
            <p>{error}</p>
            <button onClick={fetchAuditTrail} className="btn-retry">
              <i className="bi bi-arrow-clockwise me-1"></i> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="sent-requests-container">
      {/* Header section with title */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>
            <i className="bi bi-send-check me-2" style={{ color: 'var(--rose)' }}></i>
            Sent Match Proposals
          </h1>
          <p className="header-subtitle">
            Complete audit trail of all proposals sent to clients
          </p>
        </div>

        {/* Stats cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{requests.length}</div>
            <div className="stat-label">Total Sent</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {requests.filter(r => r.statusTag === 'Awaiting Family Review').length}
            </div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {requests.filter(r => r.statusTag === 'Accepted').length}
            </div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {requests.filter(r => r.statusTag.includes('Rejected')).length}
            </div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-bar">
        <label htmlFor="status-filter" className="filter-label">Filter by Status:</label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Statuses ({requests.length})</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>
              {status} ({requests.filter(r => r.statusTag === status).length})
            </option>
          ))}
        </select>
      </div>

      {/* Main Table */}
      <div className="table-wrapper">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p>No sent requests found</p>
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="btn-clear-filter"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th className="col-request-id">Request ID</th>
                <th className="col-client">Main Client</th>
                <th className="col-match">Proposed Match</th>
                <th className="col-date">Date Sent</th>
                <th className="col-status">Status Tag</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr key={request.requestId} className="table-row">
                  {/* Request ID badge */}
                  <td className="col-request-id">
                    <span className="request-id-badge">{request.requestId}</span>
                  </td>

                  {/* Client name and ID */}
                  <td className="col-client">
                    <div className="client-cell">
                      <div className="client-avatar">
                        {request.clientName.charAt(0)}
                      </div>
                      <div className="client-info">
                        <div className="client-name">{request.clientName}</div>
                        <div className="client-id">ID: {request.clientId}</div>
                      </div>
                    </div>
                  </td>

                  {/* Proposed match profile */}
                  <td className="col-match">
                    <div className="match-cell">
                      <div className="match-avatar">
                        {request.matchName.charAt(0)}
                      </div>
                      <div className="match-info">
                        <div className="match-name">{request.matchName}</div>
                        <div className="match-id">Profile: {request.matchId}</div>
                      </div>
                    </div>
                  </td>

                  {/* Date sent with calendar icon */}
                  <td className="col-date">
                    <div className="date-cell">
                      <i className="bi bi-calendar3"></i>
                      <span>{formatDate(request.dateSent)}</span>
                    </div>
                  </td>

                  {/* Status badge - color coded */}
                  <td className="col-status">
                    <span className={getStatusClasses(request.statusTag)}>
                      {request.statusTag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Info */}
      {requests.length > 0 && (
        <div className="pagination-info">
          Showing {filteredRequests.length} of {requests.length} sent proposals
        </div>
      )}
    </div>
  );
}

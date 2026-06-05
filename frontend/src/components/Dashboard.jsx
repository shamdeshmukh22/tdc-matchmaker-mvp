// Main dashboard that orchestrates clients, match suggestions, and the audit trail
import { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import ProfileDetail from './ProfileDetail';
import MatchFeed from './MatchFeed';
import SendMatchModal from './SendMatchModal';
import SentRequestsDashboard from './SentRequestsDashboard';
import { getCustomers, getMatches, getAIReview } from '../services/api';

export default function Dashboard({ onLogout }) {
  // Component state
  const [currentView, setCurrentView] = useState('clients');
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Modal state (for send match + AI review)
  const [modalShow, setModalShow] = useState(false);
  const [modalMatch, setModalMatch] = useState(null);
  const [modalMode, setModalMode] = useState('send');
  const [aiReview, setAIReview] = useState(null);
  const [aiLoading, setAILoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Load customer list when component mounts
  useEffect(() => {
    setCustomersLoading(true);
    getCustomers()
      .then(data => {
        setCustomers(data);
        setCustomersLoading(false);
      })
      .catch(err => {
        console.error('Failed to load customers:', err);
        setCustomersLoading(false);
      });
  }, []);

  // When user clicks a client in the sidebar
  const handleSelectClient = useCallback((id) => {
    const customer = customers.find(c => c.id === id);
    setSelectedId(id);
    setSelectedCustomer(customer);
    setMatches([]);

    // Load matches for this customer
    setMatchesLoading(true);
    getMatches(id)
      .then(data => {
        setMatches(data.matches || []);
        setMatchesLoading(false);
      })
      .catch(err => {
        console.error('Failed to load matches:', err);
        setMatchesLoading(false);
      });
  }, [customers]);

  // Show modal to send a match
  const handleSendMatch = useCallback((match) => {
    setModalMatch(match);
    setModalMode('send');
    setAIReview(null);
    setModalShow(true);
  }, []);

  // Get AI review for selected match
  const handleAIReview = useCallback((match) => {
    setModalMatch(match);
    setModalMode('ai');
    setAIReview(null);
    setAILoading(true);
    setModalShow(true);

    getAIReview(selectedCustomer, match)
      .then(data => {
        setAIReview(data);
        setAILoading(false);
      })
      .catch(err => {
        console.error('AI Review failed:', err);
        setAILoading(false);
      });
  }, [selectedCustomer]);

  // Show notification after sending
  const handleConfirmSend = useCallback((match) => {
    showToast(`Match invite sent to ${selectedCustomer?.firstName} about ${match.firstName} ${match.lastName}`);
  }, [selectedCustomer]);

  // Show temporary toast notification
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Render main component
  return (
    <div className="tdc-dashboard">
      {/* Header bar with logout */}
      <header className="tdc-topbar">
        <div className="tdc-logo">
          <i className="bi bi-heart-pulse-fill me-2"></i>
          The Date Crew
        </div>
        <div className="tdc-user-info">
          <span>Matchmaker Console</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--rose)', fontWeight: 600 }}>
            <i className="bi bi-person-circle me-1"></i>Admin
          </span>
          <button className="btn-logout" id="btn-logout" onClick={onLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>Logout
          </button>
        </div>
      </header>

      {/* Tabs to switch between views */}
      <div className="tdc-nav-tabs">
        <button
          className={`nav-tab ${currentView === 'clients' ? 'active' : ''}`}
          onClick={() => setCurrentView('clients')}
        >
          <i className="bi bi-person-lines-fill me-2"></i>My Clients
        </button>
        <button
          className={`nav-tab ${currentView === 'audit-trail' ? 'active' : ''}`}
          onClick={() => setCurrentView('audit-trail')}
        >
          <i className="bi bi-send-check me-2"></i>Sent History
        </button>
      </div>

      {/* Main content area */}
      {currentView === 'clients' ? (
      <div className="tdc-body">
        <Sidebar
          customers={customers}
          selectedId={selectedId}
          onSelect={handleSelectClient}
          loading={customersLoading}
        />

        <main className="tdc-main">
          {!selectedCustomer ? (
            <div className="tdc-empty-state">
              <i className="bi bi-heart-pulse-fill"></i>
              <p>Select a client from the sidebar to view their profile and match suggestions.</p>
            </div>
          ) : (
            <div className="container-fluid p-0">
              <ProfileDetail customer={selectedCustomer} />

              <MatchFeed
                matches={matches}
                loading={matchesLoading}
                onSendMatch={handleSendMatch}
                onAIReview={handleAIReview}
              />
            </div>
          )}
        </main>
      </div>
      ) : (
        <SentRequestsDashboard />
      )}

      {/* Modal for sending match or showing AI review */}
      <SendMatchModal
        show={modalShow}
        match={modalMatch}
        client={selectedCustomer}
        aiReview={aiReview}
        aiLoading={aiLoading}
        mode={modalMode}
        onClose={() => setModalShow(false)}
        onConfirmSend={handleConfirmSend}
      />

      {/* Toast notification at bottom */}
      {toast && (
        <div className="tdc-toast" id="toast-notification">
          <i className="bi bi-check-circle-fill"></i>
          {toast}
        </div>
      )}
    </div>
  );
}

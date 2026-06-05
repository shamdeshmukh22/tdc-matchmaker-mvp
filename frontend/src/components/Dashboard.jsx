/**
 * ══════════════════════════════════════════════════════════════
 * TDC Dashboard Component — Matchmaker Command Center
 * ══════════════════════════════════════════════════════════════
 * Main dashboard layout orchestrating:
 *   - Sidebar (client list)
 *   - Main Panel (profile detail + match feed)
 *   - SendMatchModal (send confirmation + AI review)
 *   - Toast notifications
 */
import { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import ProfileDetail from './ProfileDetail';
import MatchFeed from './MatchFeed';
import SendMatchModal from './SendMatchModal';
import { getCustomers, getMatches, getAIReview } from '../services/api';

export default function Dashboard({ onLogout }) {
  // ─── State ─────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Modal state
  const [modalShow, setModalShow] = useState(false);
  const [modalMatch, setModalMatch] = useState(null);
  const [modalMode, setModalMode] = useState('send'); // 'send' | 'ai'
  const [aiReview, setAIReview] = useState(null);
  const [aiLoading, setAILoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  // ─── Load Customers on Mount ───────────────────────────────
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

  // ─── Handle Client Selection ───────────────────────────────
  const handleSelectClient = useCallback((id) => {
    const customer = customers.find(c => c.id === id);
    setSelectedId(id);
    setSelectedCustomer(customer);
    setMatches([]);

    // Fetch matches for selected customer
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

  // ─── Handle Send Match ─────────────────────────────────────
  const handleSendMatch = useCallback((match) => {
    setModalMatch(match);
    setModalMode('send');
    setAIReview(null);
    setModalShow(true);
  }, []);

  // ─── Handle AI Review ──────────────────────────────────────
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

  // ─── Handle Confirm Send ───────────────────────────────────
  const handleConfirmSend = useCallback((match) => {
    showToast(`Match invite sent to ${selectedCustomer?.firstName} about ${match.firstName} ${match.lastName}`);
  }, [selectedCustomer]);

  // ─── Toast Helper ──────────────────────────────────────────
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="tdc-dashboard">
      {/* ─── Top Bar ──────────────────────────────────────── */}
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

      {/* ─── Body: Sidebar + Main ─────────────────────────── */}
      <div className="tdc-body">
        {/* Sidebar */}
        <Sidebar
          customers={customers}
          selectedId={selectedId}
          onSelect={handleSelectClient}
          loading={customersLoading}
        />

        {/* Main Panel */}
        <main className="tdc-main">
          {!selectedCustomer ? (
            <div className="tdc-empty-state">
              <i className="bi bi-heart-pulse-fill"></i>
              <p>Select a client from the sidebar to view their profile and match suggestions.</p>
            </div>
          ) : (
            <div className="container-fluid p-0">
              {/* Profile Detail */}
              <ProfileDetail customer={selectedCustomer} />

              {/* Match Suggestions */}
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

      {/* ─── Modal ────────────────────────────────────────── */}
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

      {/* ─── Toast Notification ───────────────────────────── */}
      {toast && (
        <div className="tdc-toast" id="toast-notification">
          <i className="bi bi-check-circle-fill"></i>
          {toast}
        </div>
      )}
    </div>
  );
}

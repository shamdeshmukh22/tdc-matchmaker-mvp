// Simple Axios instance for API calls
import axios from 'axios';
const VITE_API_URL=import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Get all customers
export const getCustomers = () => api.get('/customers').then(r => r.data);

// Get single customer detail
export const getCustomer = (id) => api.get(`/customers/${id}`).then(r => r.data);

// Get match suggestions for a customer
export const getMatches = (id) => api.get(`/customers/${id}/matches`).then(r => r.data);

// Get AI compatibility review for two profiles
export const getAIReview = (client, match) =>
  api.post('/matches/ai-review', { client, match }).then(r => r.data);

// Send a match proposal and add to audit trail
export const sendMatchProposal = (data) =>
  api.post('/matches/send', data).then(r => r.data);

// Fetch audit trail of all sent proposals
export const getAuditTrail = () =>
  api.get('/matches/audit-trail').then(r => r.data);

export default api;


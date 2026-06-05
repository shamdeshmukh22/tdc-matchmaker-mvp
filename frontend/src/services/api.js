/**
 * TDC API Service — Axios client for backend communication
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

/** Fetch all assigned customers */
export const getCustomers = () => api.get('/customers').then(r => r.data);

/** Fetch single customer detail */
export const getCustomer = (id) => api.get(`/customers/${id}`).then(r => r.data);

/** Fetch match suggestions for a customer */
export const getMatches = (id) => api.get(`/customers/${id}/matches`).then(r => r.data);

/** Request AI compatibility review */
export const getAIReview = (client, match) =>
  api.post('/matches/ai-review', { client, match }).then(r => r.data);

export default api;

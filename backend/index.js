/**
 * ──────────────────────────────────────────────────────────────
 * TDC Backend — Express Server Entry Point
 * ──────────────────────────────────────────────────────────────
 * Serves API endpoints for the Matchmaker Command Center.
 * Loads customer & profile data from local JSON mock database.
 * ──────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const matchRoutes = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────

// Enable CORS for the React dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// ─── Static Data ─────────────────────────────────────────────

const customers = require('./data/customers.json');
const profiles = require('./data/profiles.json');

// Make data available to route handlers via app.locals
app.locals.customers = customers;
app.locals.profiles = profiles;

// ─── Routes ──────────────────────────────────────────────────

// Customer endpoints
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.get('/api/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

// Match-related endpoints
app.use('/api', matchRoutes);

// ─── Health Check ────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TDC Matchmaker API',
    profiles: profiles.length,
    customers: customers.length
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// TDC backend - simple Express server that serves matchmaker data via API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const matchRoutes = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 5000;
const FrontendURL = process.env.FRONTEND_URL ;
// CORS and JSON parsing setup
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174',FrontendURL],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Load customer & profile data from JSON files

const customers = require('./data/customers.json');
const profiles = require('./data/profiles.json');

// Load sent match log (for the new audit trail feature)
const sentRequestsPath = path.join(__dirname, 'data', 'sentRequests.json');
let sentRequests = [];
try {
  sentRequests = require(sentRequestsPath);
} catch (err) {
  console.warn('⚠️  sentRequests.json not found — starting with empty audit trail');
  sentRequests = [];
}

// Make this data accessible to route handlers
app.locals.customers = customers;
app.locals.profiles = profiles;
app.locals.sentRequests = sentRequests;

// Customer API endpoints

// Customer endpoints
app.get("/",function(req,res){
  res.send("backend is ready");
})
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

// Simple health check endpoint

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

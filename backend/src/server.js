require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Route files
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const supplierBillRoutes = require('./routes/supplierBillRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Initialize MongoDB Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Ensure database connection on serverless API invocations
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error('[DB Reconnect Failed]:', err.message);
    }
  }
  next();
});

// Root endpoint - API status & documentation
app.get('/', (req, res) => {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  const indexPath = path.join(frontendDist, 'index.html');

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  const dbState = mongoose.connection.readyState;
  const dbStatusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  const isDbConnected = dbState === 1;

  if (req.accepts('html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>தேவா & கோ – REST API</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #F6F8F5; color: #25332C; padding: 2rem 1rem; }
    .container { max-width: 680px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5EBE6; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge-ok { background: #EAF4ED; color: #176B45; }
    .badge-warn { background: #FEF3C7; color: #B45309; }
    h1 { font-size: 1.4rem; color: #176B45; margin-top: 1rem; margin-bottom: 0.25rem; }
    .subtitle { color: #748078; font-size: 0.95rem; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
    .card { background: #F6F8F5; border: 1px solid #E5EBE6; border-radius: 8px; padding: 1rem; }
    .card-label { font-size: 0.75rem; color: #748078; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
    .card-val { font-size: 1rem; font-weight: 700; color: #25332C; }
    .endpoints-title { font-size: 0.95rem; font-weight: 700; color: #25332C; margin-bottom: 0.75rem; border-bottom: 1px solid #E5EBE6; padding-bottom: 0.5rem; }
    ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
    li { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 6px 10px; background: #F6F8F5; border-radius: 6px; }
    a { color: #176B45; font-weight: 600; text-decoration: none; font-family: monospace; }
    a:hover { text-decoration: underline; }
    .footer { text-align: center; margin-top: 1.5rem; font-size: 0.75rem; color: #748078; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge ${isDbConnected ? 'badge-ok' : 'badge-warn'}">
      ● ${isDbConnected ? 'Operational' : 'Database Initializing'}
    </span>
    <h1>தேவா & கோ – தக்காளி & காய்கனி கமிஷன் மண்டி</h1>
    <p class="subtitle">DEVA & CO – Tomato Wholesale Billing & Tally REST API</p>
    
    <div class="grid">
      <div class="card">
        <div class="card-label">Server Status</div>
        <div class="card-val" style="color: #176B45;">Online (v1.0.0)</div>
      </div>
      <div class="card">
        <div class="card-label">Database Status</div>
        <div class="card-val" style="color: ${isDbConnected ? '#176B45' : '#D99A36'};">${dbStatusMap[dbState] || 'Unknown'}</div>
      </div>
    </div>

    <div class="endpoints-title">Verified API Endpoints</div>
    <ul>
      <li><span>Health Check (System & DB)</span> <a href="/api/health">/api/health</a></li>
      <li><span>Mandi Store Settings</span> <a href="/api/settings">/api/settings</a></li>
      <li><span>Authentication Login</span> <code>POST /api/auth/login</code></li>
      <li><span>Operations Dashboard Stats</span> <code>GET /api/dashboard/stats</code></li>
      <li><span>Buyer Ledgers & Tally</span> <code>GET /api/buyers</code></li>
      <li><span>Supplier Accounts & Lots</span> <code>GET /api/suppliers</code></li>
    </ul>

    <div class="footer">
      54 A, அண்ணல் காந்தி மார்க்கெட், திண்டுக்கல் – 624 001 | Prop: R. தேவதாஸ்
    </div>
  </div>
</body>
</html>`);
  }

  res.json({
    name: 'DEVA & CO Tomato Wholesale Billing API',
    business: 'தேவா & கோ – தக்காளி & காய்கனி கமிஷன் மண்டி',
    status: 'online',
    version: '1.0.0',
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      readyState: dbState
    },
    endpoints: {
      health: '/api/health',
      settings: '/api/settings',
      auth: '/api/auth/login',
      dashboard: '/api/dashboard/stats',
      buyers: '/api/buyers',
      suppliers: '/api/suppliers',
      transactions: '/api/transactions',
      supplierBills: '/api/supplier-bills',
      expenses: '/api/expenses',
      reports: '/api/reports'
    }
  });
});

// Health check endpoint with database connectivity status (safe, no secrets)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const isDbConnected = dbState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    application: 'DEVA & CO Billing & Tally API',
    business: 'தேவா & கோ – தக்காளி & காய்கனி கமிஷன் மண்டி',
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      readyState: dbState
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/supplier-bills', supplierBillRoutes);
app.use('/api/outlay', expenseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Catch-all route handler
app.all('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint '${req.originalUrl}' not found`,
      healthCheck: '/api/health'
    });
  }

  const frontendDist = path.join(__dirname, '../../frontend/dist');
  const indexPath = path.join(frontendDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.redirect('/');
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[DEVA & CO API Server] Running on http://localhost:${PORT}`);
  });
}

module.exports = app;

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Models for initial database validation & bootstrap
const User = require('./models/User');
const Settings = require('./models/Settings');

// Route files
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const supplierPaymentRoutes = require('./routes/supplierPaymentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const supplierBillRoutes = require('./routes/supplierBillRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Initialize MongoDB Connection in background
connectDB().catch((err) => {
  console.error('[Background DB Connection Init Error]:', err.message);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Locate Frontend Distribution Directory (supporting multiple deployment structures)
const candidateFrontendPaths = [
  path.join(__dirname, '../public'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../dist'),
  path.join(process.cwd(), 'backend/public'),
  path.join(process.cwd(), 'frontend/dist'),
  path.join(process.cwd(), 'public')
];

const frontendDist = candidateFrontendPaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || path.join(__dirname, '../public');

// Serve static frontend assets (CSS, JS, images, fonts)
app.use(express.static(frontendDist));

// Bootstrap default user/settings once on an empty database without modifying existing data
let isInitialized = false;
const ensureInitialDefaults = async () => {
  if (isInitialized) return;
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        username: 'admin',
        password: 'Admin@123',
        name: 'R. தேவதாஸ் (உரிமையாளர்)',
        role: 'ADMIN',
        phone: '94433 18359'
      });
      console.log('[Bootstrap] Initial Admin user verified: admin / Admin@123');
    }

    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        storeName: 'தேவா & கோ',
        tagline: 'தக்காளி & காய்கனி கமிஷன் மண்டி',
        proprietor: 'R. தேவதாஸ்',
        address: '54 A, அண்ணல் காந்தி மார்க்கெட், திண்டுக்கல் – 624 001',
        phones: ['94433 18359', '95853 56765'],
        footerNote: 'தாங்கள் வருகை நல்வரவு !',
        defaultCommissionRate: 10,
        buyerBillFormat: 'square',
        supplierBillFormat: 'pad'
      });
      console.log('[Bootstrap] Initial Store Settings verified for தேவா & கோ');
    }
    isInitialized = true;
  } catch (err) {
    console.error('[Bootstrap Defaults Error]:', err.message);
  }
};

// Global Request Middleware: Guarantee DB connection is ready before route handlers execute
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!isInitialized && mongoose.connection.readyState === 1) {
      await ensureInitialDefaults();
    }
  } catch (err) {
    console.error('[DB Request Middleware Error]:', err.message);
  }
  next();
});

// Root endpoint: Serves the actual DEVA & CO React Billing Web Application
app.get('/', (req, res) => {
  const indexPath = path.join(frontendDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    return res.sendFile(indexPath);
  }
  res.redirect('/api');
});

// API Documentation & Status Dashboard endpoint
app.get('/api', async (req, res) => {
  let isDbConnected = false;
  let pingLatencyMs = null;
  const dbStatusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };

  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      const startTime = Date.now();
      await mongoose.connection.db.command({ ping: 1 });
      pingLatencyMs = Date.now() - startTime;
      isDbConnected = true;
    }
  } catch (err) {
    console.error('[API Ping Command Error]:', err.message);
  }

  const dbState = mongoose.connection.readyState;
  const dbStatusLabel = isDbConnected ? 'Connected' : (dbStatusMap[dbState] || 'Disconnected');

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
    .btn-app { display: inline-block; margin-top: 1rem; padding: 8px 16px; background-color: #176B45; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 0.9rem; }
    .btn-app:hover { background-color: #125538; }
    .footer { text-align: center; margin-top: 1.5rem; font-size: 0.75rem; color: #748078; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge ${isDbConnected ? 'badge-ok' : 'badge-warn'}">
      ● ${isDbConnected ? 'Operational' : 'Database Disconnected'}
    </span>
    <h1>தேவா & கோ – தக்காளி & காய்கனி கமிஷன் மண்டி</h1>
    <p class="subtitle">DEVA & CO – Tomato Wholesale Billing & Tally REST API</p>
    
    <div style="margin-bottom: 1.5rem;">
      <a href="/" class="btn-app">Open Billing Application UI</a>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-label">Server Status</div>
        <div class="card-val" style="color: #176B45;">Online (v1.0.0)</div>
      </div>
      <div class="card">
        <div class="card-label">Database Status</div>
        <div class="card-val" style="color: ${isDbConnected ? '#176B45' : '#D99A36'};">${dbStatusLabel} ${pingLatencyMs !== null ? `(${pingLatencyMs}ms)` : ''}</div>
      </div>
    </div>

    <div class="endpoints-title">Verified API Endpoints</div>
    <ul>
      <li><span>Health Check (System & DB Ping)</span> <a href="/api/health">/api/health</a></li>
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
      status: isDbConnected ? 'connected' : 'disconnected',
      verifiedOperation: isDbConnected,
      pingLatencyMs: pingLatencyMs,
      readyState: dbState,
      databaseName: mongoose.connection.name || null
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

// Health check endpoint with real round-trip database ping (safe, no secrets)
app.get('/api/health', async (req, res) => {
  let isDbConnected = false;
  let pingLatencyMs = null;
  let dbName = null;

  try {
    const startTime = Date.now();
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.command({ ping: 1 });
      pingLatencyMs = Date.now() - startTime;
      isDbConnected = true;
      dbName = mongoose.connection.name;
    }
  } catch (err) {
    console.error('[Health Check DB Ping Error]:', err.message);
  }

  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    application: 'DEVA & CO Billing & Tally API',
    business: 'தேவா & கோ – தக்காளி & காய்கனி கமிஷன் மண்டி',
    database: {
      status: isDbConnected ? 'connected' : (dbStatusMap[dbState] || 'disconnected'),
      verifiedOperation: isDbConnected,
      databaseName: dbName,
      pingLatencyMs: pingLatencyMs,
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
app.use('/api/supplier-payments', supplierPaymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/supplier-bills', supplierBillRoutes);
app.use('/api/outlay', expenseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// Asset Fallback: Guarantee missing or older chunk requests receive JavaScript/CSS, never HTML
app.get('/assets/:filename', (req, res) => {
  const filename = req.params.filename;
  const assetsDir = path.join(frontendDist, 'assets');
  const requestedPath = path.join(assetsDir, filename);

  if (fs.existsSync(requestedPath)) {
    return res.sendFile(requestedPath);
  }

  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    if (filename.endsWith('.js')) {
      const fallbackJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
      if (fallbackJs) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        return res.sendFile(path.join(assetsDir, fallbackJs));
      }
    } else if (filename.endsWith('.css')) {
      const fallbackCss = files.find(f => f.startsWith('index-') && f.endsWith('.css'));
      if (fallbackCss) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
        return res.sendFile(path.join(assetsDir, fallbackCss));
      }
    }
  }

  res.status(404).type('text/plain').send('Asset not found');
});

// Catch-all route handler for client-side React Router (SPA)
app.all('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint '${req.originalUrl}' not found`,
      healthCheck: '/api/health'
    });
  }

  if (req.path.startsWith('/assets/')) {
    return res.status(404).type('text/plain').send('Asset not found');
  }

  const indexPath = path.join(frontendDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    return res.sendFile(indexPath);
  }

  res.redirect('/api');
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

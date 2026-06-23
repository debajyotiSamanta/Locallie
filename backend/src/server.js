const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./db/db');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  // Also strip trailing slash just in case
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed));
    if (isAllowed || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to allow connection in case of mismatches
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount routes
app.use('/api', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({ status: "ok", message: "Welcome to LocalFix AI Hyperlocal Backend API. Visit /health or /api for endpoints." });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: "ok", message: "LocalFix AI Hyperlocal Backend is running" });
});

// Export app for serverless environments (e.g. Vercel)
module.exports = app;

// Start Server conditionally (only if not running on serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(` LocalFix AI Backend Server is running on port ${PORT}`);
    console.log(` API Endpoint: http://localhost:${PORT}/api`);
    console.log(`================================================`);
  });
}

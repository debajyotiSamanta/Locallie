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
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: "ok", message: "Locallie AI Hyperlocal Backend is running" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(` Locallie AI Backend Server is running on port ${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api`);
  console.log(`================================================`);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Body Parser & URL Encoded
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Enable CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Static directory for uploaded evidence & generated report PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Centralized Environmental Audit Management System (CEAMS) API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/sites', require('./src/routes/siteRoutes'));
app.use('/api/audits', require('./src/routes/auditRoutes'));
app.use('/api/checklists', require('./src/routes/checklistRoutes'));
app.use('/api/inspections', require('./src/routes/inspectionRoutes'));
app.use('/api/findings', require('./src/routes/findingRoutes'));
app.use('/api/capa', require('./src/routes/capaRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/audit-logs', require('./src/routes/auditLogRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/settings', require('./src/routes/settingRoutes'));

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server = null;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  CEAMS Backend API Server running on port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;

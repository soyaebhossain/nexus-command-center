const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount REST API
app.use('/api', apiRoutes);

// Serve Frontend Static Assets
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

// SPA Fallback: send index.html for any unhandled routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Start Full-Stack Server
app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 NEXUS Life OS Full-Stack Server running on port ${PORT}`);
  console.log(`🌐 Web App URL: http://localhost:${PORT}`);
  console.log(`⚡ REST API URL: http://localhost:${PORT}/api/health`);
  console.log('========================================================');
});

module.exports = app;

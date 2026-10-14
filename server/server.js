const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount REST API
app.use('/api', apiRoutes);

// Determine Static Directory: prefer 'dist' if built, fallback to root
const distDir = path.join(__dirname, '..', 'dist');
const rootDir = path.join(__dirname, '..');
const staticDir = fs.existsSync(distDir) ? distDir : rootDir;

app.use(express.static(staticDir));

// SPA Fallback: send index.html for any unhandled routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Start Full-Stack Server
app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 NEXUS Life OS Full-Stack Server running on port ${PORT}`);
  console.log(`🌐 Serving UI from: ${staticDir}`);
  console.log(`🌐 Web App URL: http://localhost:${PORT}`);
  console.log(`⚡ REST API URL: http://localhost:${PORT}/api/health`);
  console.log('========================================================');
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Environment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not loaded');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Not loaded');

const connectDatabase = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const studyRoutes = require('./routes/studyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/pages')));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);

// Serve HTML pages with explicit routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
});

// Catch all handler - serve index.html for any other route (for SPA)
app.get('*', (req, res) => {
  // If it's an API route, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  // Otherwise serve the main app
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Connect to database and start server
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 MongoDB connected`);
    console.log(`🔗 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
    console.log(`🔐 Login page: http://localhost:${PORT}/login`);
    console.log(`📝 Register page: http://localhost:${PORT}/register`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
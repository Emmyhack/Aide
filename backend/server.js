const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection (lazy)
let isDbConnecting = false;
let isDbConfigured = Boolean(process.env.MONGODB_URI) || process.env.NODE_ENV !== 'production';
let hasLoggedDbConfig = false;

const getMongoUri = () => {
  // Use local DB only outside production by default
  return process.env.MONGODB_URI || (process.env.NODE_ENV !== 'production' ? 'mongodb://localhost:27017/volunteer-hub' : null);
};

const connectDB = async () => {
  const uri = getMongoUri();
  if (!uri) {
    if (!hasLoggedDbConfig) {
      console.warn('MONGODB_URI not configured. API routes that require DB will be unavailable.');
      hasLoggedDbConfig = true;
    }
    return;
  }
  if (mongoose.connection.readyState === 1 || isDbConnecting) return;
  try {
    isDbConnecting = true;
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
  } finally {
    isDbConnecting = false;
  }
};

// Ensure DB connection for API routes
const ensureDb = async (req, res, next) => {
  const uri = getMongoUri();
  if (!uri) {
    return res.status(503).json({ message: 'Database not configured' });
  }
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database unavailable' });
    }
    next();
  } catch (err) {
    console.error('DB ensure error:', err);
    return res.status(503).json({ message: 'Database unavailable' });
  }
};

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const registrationRoutes = require('./routes/registrations');

// Health check endpoints (should not require DB)
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ 
    message: 'Community Volunteer Hub API is running!', 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Community Volunteer Hub API is running!', 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// All /api routes require DB
app.use('/api', ensureDb);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/registrations', registrationRoutes);

// Dynamic sitemap for SEO
app.get('/sitemap.xml', (req, res) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;
  const urls = [
    '/', '/events', '/login', '/dashboard', '/profile'
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `\n  <url>\n    <loc>${baseUrl}${u}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${u === '/' ? '1.0' : '0.7'}</priority>\n  </url>`).join('') +
    `\n</urlset>`;
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
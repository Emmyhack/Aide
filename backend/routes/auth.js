const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify Civic Auth token (placeholder - will be implemented with actual Civic Auth)
const verifyCivicAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }
    
    const civicClientId = process.env.CIVIC_AUTH_CLIENT_ID || 'f2fc33e0-3b6b-4ea7-bb5e-a5f60b45e808';
    // TODO: Implement actual Civic Auth verification using civicClientId if SDK/endpoint available
    // For now, simulate a verified token and extract minimal user info
    const simulatedEmail = req.headers['x-demo-email'] || 'user@example.com';
    const simulatedName = req.headers['x-demo-name'] || 'Test User';
    
    // Simulated user data from Civic Auth
    const civicUserData = {
      id: token.startsWith('civic_') ? token : 'civic_' + Buffer.from(token).toString('hex').slice(0, 16),
      email: simulatedEmail,
      name: simulatedName,
      profilePicture: null
    };
    
    req.civicUser = civicUserData;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

// POST /api/auth/login - Handle Civic Auth login
router.post('/login', verifyCivicAuth, async (req, res) => {
  try {
    const { civicUser } = req;
    
    // Find or create user in our database
    let user = await User.findOne({ civicId: civicUser.id });
    
    if (!user) {
      // Create new user
      user = new User({
        civicId: civicUser.id,
        email: civicUser.email,
        name: civicUser.name,
        profilePicture: civicUser.profilePicture,
        lastLogin: new Date()
      });
      await user.save();
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }
    
    // Return user data (excluding sensitive information)
    const userResponse = {
      id: user._id,
      civicId: user.civicId,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      location: user.location,
      interests: user.interests,
      skills: user.skills,
      bio: user.bio,
      stats: user.stats,
      notifications: user.notifications,
      totalEvents: user.totalEvents,
      createdAt: user.createdAt
    };
    
    res.json({
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// POST /api/auth/logout - Handle logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// GET /api/auth/verify - Verify authentication status
router.get('/verify', verifyCivicAuth, async (req, res) => {
  try {
    const user = await User.findOne({ civicId: req.civicUser.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userResponse = {
      id: user._id,
      civicId: user.civicId,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      location: user.location,
      interests: user.interests,
      skills: user.skills,
      bio: user.bio,
      stats: user.stats,
      notifications: user.notifications,
      totalEvents: user.totalEvents,
      createdAt: user.createdAt
    };
    
    res.json({
      message: 'Token valid',
      user: userResponse
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

// Middleware to protect routes (export for use in other routes)
router.authMiddleware = verifyCivicAuth;

module.exports = router;
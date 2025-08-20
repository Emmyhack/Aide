const express = require('express');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { authMiddleware } = require('./auth');
const router = express.Router();

// GET /api/users/profile - Get current user's profile (protected)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ civicId: req.civicUser.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
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
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// PUT /api/users/profile - Update current user's profile (protected)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'location', 'interests', 'skills', 'bio', 'notifications'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const user = await User.findOneAndUpdate(
      { civicId: req.civicUser.id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: {
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
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ message: 'Failed to update profile', error: error.message });
  }
});

// GET /api/users/dashboard - Get user's dashboard data (protected)
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ civicId: req.civicUser.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's registrations with event details
    const volunteerRegistrations = await Registration.find({
      user: user._id,
      type: 'volunteer',
      status: { $in: ['approved', 'confirmed', 'attended'] }
    })
    .populate('event', 'title startDate endDate location status category')
    .sort({ createdAt: -1 })
    .limit(10);
    
    const partnershipRegistrations = await Registration.find({
      user: user._id,
      type: 'partner',
      status: { $in: ['approved', 'active', 'completed'] }
    })
    .populate('event', 'title startDate endDate location status category')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Get upcoming events
    const upcomingEvents = [...volunteerRegistrations, ...partnershipRegistrations]
      .filter(reg => reg.event && reg.event.startDate > new Date())
      .sort((a, b) => new Date(a.event.startDate) - new Date(b.event.startDate))
      .slice(0, 5);
    
    // Get recent activity
    const recentActivity = [...volunteerRegistrations, ...partnershipRegistrations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    
    // Calculate stats
    const stats = {
      totalVolunteerEvents: volunteerRegistrations.length,
      totalPartnerships: partnershipRegistrations.length,
      totalEvents: volunteerRegistrations.length + partnershipRegistrations.length,
      upcomingEvents: upcomingEvents.length,
      completedEvents: [...volunteerRegistrations, ...partnershipRegistrations]
        .filter(reg => reg.status === 'attended' || reg.status === 'completed').length,
      impactScore: user.stats.impactScore,
      totalHours: user.stats.totalVolunteerHours
    };
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        stats: user.stats
      },
      stats,
      upcomingEvents,
      recentActivity,
      volunteerRegistrations: volunteerRegistrations.slice(0, 5),
      partnershipRegistrations: partnershipRegistrations.slice(0, 5)
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard', error: error.message });
  }
});

// GET /api/users/events - Get user's events with filtering (protected)
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const {
      type = 'all', // 'volunteer', 'partner', 'all'
      status = 'all', // 'upcoming', 'past', 'active', 'all'
      page = 1,
      limit = 10
    } = req.query;
    
    const user = await User.findOne({ civicId: req.civicUser.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Build query
    const query = { user: user._id };
    
    if (type !== 'all') {
      query.type = type;
    }
    
    if (status !== 'all') {
      if (status === 'upcoming') {
        // We'll filter this after populating events
      } else if (status === 'past') {
        // We'll filter this after populating events
      } else if (status === 'active') {
        query.status = { $in: ['approved', 'confirmed', 'attended', 'active', 'completed'] };
      }
    }
    
    const registrations = await Registration.find(query)
      .populate('event')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Filter by event timing if needed
    let filteredRegistrations = registrations;
    if (status === 'upcoming') {
      filteredRegistrations = registrations.filter(reg => 
        reg.event && reg.event.startDate > new Date()
      );
    } else if (status === 'past') {
      filteredRegistrations = registrations.filter(reg => 
        reg.event && reg.event.endDate < new Date()
      );
    }
    
    const total = await Registration.countDocuments(query);
    
    res.json({
      registrations: filteredRegistrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('User events fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user events', error: error.message });
  }
});

// GET /api/users/stats - Get detailed user statistics (protected)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ civicId: req.civicUser.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get detailed registration stats
    const volunteerStats = await Registration.aggregate([
      { $match: { user: user._id, type: 'volunteer' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const partnershipStats = await Registration.aggregate([
      { $match: { user: user._id, type: 'partner' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get category distribution
    const categoryStats = await Registration.aggregate([
      { $match: { user: user._id } },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventData'
        }
      },
      { $unwind: '$eventData' },
      {
        $group: {
          _id: '$eventData.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get monthly activity for the past year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const monthlyActivity = await Registration.aggregate([
      { 
        $match: { 
          user: user._id,
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          volunteer: {
            $sum: { $cond: [{ $eq: ['$type', 'volunteer'] }, 1, 0] }
          },
          partnership: {
            $sum: { $cond: [{ $eq: ['$type', 'partner'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      overview: user.stats,
      volunteerStats: volunteerStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      partnershipStats: partnershipStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      categoryDistribution: categoryStats,
      monthlyActivity
    });
  } catch (error) {
    console.error('User stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user stats', error: error.message });
  }
});

// DELETE /api/users/account - Delete user account (protected)
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ civicId: req.civicUser.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete all user registrations
    await Registration.deleteMany({ user: user._id });
    
    // Delete user account
    await User.findByIdAndDelete(user._id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
});

// GET /api/users/:id/public - Get public user profile
router.get('/:id/public', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name profilePicture location interests skills bio stats createdAt');
    
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get public achievements
    const publicRegistrations = await Registration.find({
      user: user._id,
      status: { $in: ['attended', 'completed'] },
      'consent.publicProfile': true
    })
    .populate('event', 'title category startDate')
    .sort({ createdAt: -1 })
    .limit(10);
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        location: user.location,
        interests: user.interests,
        skills: user.skills,
        bio: user.bio,
        stats: {
          impactScore: user.stats.impactScore,
          eventsAttended: user.stats.eventsAttended,
          partnershipsCompleted: user.stats.partnershipsCompleted
        },
        memberSince: user.createdAt
      },
      achievements: publicRegistrations
    });
  } catch (error) {
    console.error('Public profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch public profile', error: error.message });
  }
});

module.exports = router;
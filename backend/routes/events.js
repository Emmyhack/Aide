const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { authMiddleware } = require('./auth');
const router = express.Router();

// GET /api/events - Get all events with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      location,
      search,
      type = 'all', // 'volunteer', 'partnership', 'all'
      status = 'published',
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;
    
    // Build query
    const query = { status };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (location) {
      query.$or = [
        { 'location.address.city': new RegExp(location, 'i') },
        { 'location.address.state': new RegExp(location, 'i') },
        { 'location.address.country': new RegExp(location, 'i') }
      ];
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by opportunity type
    if (type === 'volunteer') {
      query['volunteerOpportunities.isAcceptingVolunteers'] = true;
    } else if (type === 'partnership') {
      query['partnershipOpportunities.isAcceptingPartners'] = true;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const events = await Event.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-registrations') // Exclude registrations for performance
      .lean();
    
    // Get total count for pagination
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

// GET /api/events/:id - Get single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registrations.volunteers.userId', 'name profilePicture stats')
      .populate('registrations.partners.userId', 'name profilePicture');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Increment view count
    await Event.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } });
    
    res.json(event);
  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
});

// GET /api/events/slug/:slug - Get event by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const event = await Event.findOne({ 'seo.slug': req.params.slug })
      .populate('registrations.volunteers.userId', 'name profilePicture stats')
      .populate('registrations.partners.userId', 'name profilePicture');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Increment view count
    await Event.findOneAndUpdate(
      { 'seo.slug': req.params.slug }, 
      { $inc: { 'stats.views': 1 } }
    );
    
    res.json(event);
  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
});

// POST /api/events - Create new event (protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      'organizer.email': req.civicUser.email // Ensure organizer email matches authenticated user
    };
    
    const event = new Event(eventData);
    await event.save();
    
    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(400).json({ message: 'Failed to create event', error: error.message });
  }
});

// PUT /api/events/:id - Update event (protected route)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizer.email !== req.civicUser.email) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Event update error:', error);
    res.status(400).json({ message: 'Failed to update event', error: error.message });
  }
});

// DELETE /api/events/:id - Delete event (protected route)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizer.email !== req.civicUser.email) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
});

// GET /api/events/:id/registrations - Get event registrations (protected route)
router.get('/:id/registrations', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizer.email !== req.civicUser.email) {
      return res.status(403).json({ message: 'Not authorized to view registrations' });
    }
    
    const registrations = await Registration.find({ event: req.params.id })
      .populate('user', 'name email profilePicture stats')
      .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (error) {
    console.error('Registrations fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
  }
});

// GET /api/events/categories - Get all event categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    'Technology',
    'Education',
    'Healthcare',
    'Environment',
    'Community Development',
    'Arts & Culture',
    'Sports & Recreation',
    'Social Services',
    'Business & Entrepreneurship',
    'Other'
  ];
  
  res.json({ categories });
});

// GET /api/events/stats/overview - Get events overview stats
router.get('/stats/overview', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ status: 'published' });
    const upcomingEvents = await Event.countDocuments({ 
      status: 'published',
      startDate: { $gt: new Date() }
    });
    const ongoingEvents = await Event.countDocuments({ 
      status: 'ongoing'
    });
    const totalVolunteers = await Registration.countDocuments({ 
      type: 'volunteer',
      status: { $in: ['approved', 'confirmed', 'attended'] }
    });
    const totalPartners = await Registration.countDocuments({ 
      type: 'partner',
      status: { $in: ['approved', 'active', 'completed'] }
    });
    
    // Get category distribution
    const categoryStats = await Event.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      overview: {
        totalEvents,
        upcomingEvents,
        ongoingEvents,
        totalVolunteers,
        totalPartners
      },
      categories: categoryStats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

module.exports = router;
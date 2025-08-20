const express = require('express');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { authMiddleware } = require('./auth');
const router = express.Router();

// POST /api/registrations - Create new registration (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { eventId, type, volunteerDetails, partnershipDetails, customResponses, consent } = req.body;
    
    // Find the user and event
    const user = await User.findOne({ civicId: req.civicUser.id });
    const event = await Event.findById(eventId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if event is accepting registrations
    if (type === 'volunteer' && !event.volunteerOpportunities.isAcceptingVolunteers) {
      return res.status(400).json({ message: 'Event is not accepting volunteers' });
    }
    
    if (type === 'partner' && !event.partnershipOpportunities.isAcceptingPartners) {
      return res.status(400).json({ message: 'Event is not accepting partners' });
    }
    
    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      user: user._id,
      event: eventId
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'You are already registered for this event',
        registration: existingRegistration
      });
    }
    
    // Check capacity limits
    if (type === 'volunteer') {
      const currentVolunteers = event.volunteerOpportunities.currentVolunteers;
      const maxVolunteers = event.volunteerOpportunities.maxVolunteers;
      
      if (currentVolunteers >= maxVolunteers) {
        return res.status(400).json({ message: 'Event has reached volunteer capacity' });
      }
    }
    
    // Create registration
    const registrationData = {
      user: user._id,
      event: eventId,
      type,
      customResponses: customResponses || [],
      consent: {
        dataProcessing: true,
        communications: consent?.communications !== false,
        photoRelease: consent?.photoRelease || false,
        publicProfile: consent?.publicProfile || false
      },
      registrationSource: 'web',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    if (type === 'volunteer' && volunteerDetails) {
      registrationData.volunteerDetails = volunteerDetails;
    }
    
    if (type === 'partner' && partnershipDetails) {
      registrationData.partnershipDetails = partnershipDetails;
      // Partnerships require approval by default
      registrationData.status = 'pending';
    }
    
    const registration = new Registration(registrationData);
    await registration.save();
    
    // Update event registration counts
    if (type === 'volunteer') {
      await Event.findByIdAndUpdate(eventId, {
        $push: {
          'registrations.volunteers': {
            userId: user._id,
            registeredAt: new Date(),
            role: volunteerDetails?.preferredRole,
            status: registration.status
          }
        },
        $inc: { 'volunteerOpportunities.currentVolunteers': 1 }
      });
      
      // Update user volunteer events
      await User.findByIdAndUpdate(user._id, {
        $push: {
          'volunteerEvents': {
            eventId: eventId,
            registeredAt: new Date(),
            status: registration.status
          }
        }
      });
    } else if (type === 'partner') {
      await Event.findByIdAndUpdate(eventId, {
        $push: {
          'registrations.partners': {
            userId: user._id,
            registeredAt: new Date(),
            partnershipType: partnershipDetails?.partnershipType,
            status: registration.status,
            contribution: partnershipDetails?.contribution?.description,
            fundingAmount: partnershipDetails?.contribution?.value
          }
        }
      });
      
      // Update user partnership events
      await User.findByIdAndUpdate(user._id, {
        $push: {
          'partnershipEvents': {
            eventId: eventId,
            registeredAt: new Date(),
            partnershipType: partnershipDetails?.partnershipType,
            status: registration.status,
            contribution: partnershipDetails?.contribution?.description,
            fundingAmount: partnershipDetails?.contribution?.value
          }
        }
      });
    }
    
    // Populate the registration with user and event data
    const populatedRegistration = await Registration.findById(registration._id)
      .populate('user', 'name email profilePicture')
      .populate('event', 'title startDate location organizer');
    
    res.status(201).json({
      message: 'Registration successful',
      registration: populatedRegistration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

// GET /api/registrations/:id - Get registration by ID (protected)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ civicId: req.civicUser.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const registration = await Registration.findById(req.params.id)
      .populate('user', 'name email profilePicture')
      .populate('event', 'title startDate endDate location organizer status');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Check if user owns this registration or is the event organizer
    const isOwner = registration.user._id.toString() === user._id.toString();
    const isOrganizer = registration.event.organizer.email === req.civicUser.email;
    
    if (!isOwner && !isOrganizer) {
      return res.status(403).json({ message: 'Not authorized to view this registration' });
    }
    
    res.json(registration);
  } catch (error) {
    console.error('Registration fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch registration', error: error.message });
  }
});

// PUT /api/registrations/:id - Update registration (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ civicId: req.civicUser.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Check if user owns this registration
    if (registration.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this registration' });
    }
    
    // Only allow certain fields to be updated
    const allowedUpdates = [
      'volunteerDetails', 'partnershipDetails', 'customResponses', 
      'notes.user', 'consent'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const updatedRegistration = await Registration.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'name email profilePicture')
     .populate('event', 'title startDate location organizer');
    
    res.json({
      message: 'Registration updated successfully',
      registration: updatedRegistration
    });
  } catch (error) {
    console.error('Registration update error:', error);
    res.status(400).json({ message: 'Failed to update registration', error: error.message });
  }
});

// DELETE /api/registrations/:id - Cancel registration (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ civicId: req.civicUser.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Check if user owns this registration
    if (registration.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this registration' });
    }
    
    // Update registration status to cancelled
    registration.status = 'cancelled';
    await registration.save();
    
    // Update event registration counts
    if (registration.type === 'volunteer') {
      await Event.findByIdAndUpdate(registration.event, {
        $pull: { 'registrations.volunteers': { userId: user._id } },
        $inc: { 'volunteerOpportunities.currentVolunteers': -1 }
      });
      
      // Update user volunteer events
      await User.findByIdAndUpdate(user._id, {
        $pull: { 'volunteerEvents': { eventId: registration.event } }
      });
    } else if (registration.type === 'partner') {
      await Event.findByIdAndUpdate(registration.event, {
        $pull: { 'registrations.partners': { userId: user._id } }
      });
      
      // Update user partnership events
      await User.findByIdAndUpdate(user._id, {
        $pull: { 'partnershipEvents': { eventId: registration.event } }
      });
    }
    
    res.json({ 
      message: 'Registration cancelled successfully',
      registration 
    });
  } catch (error) {
    console.error('Registration cancellation error:', error);
    res.status(500).json({ message: 'Failed to cancel registration', error: error.message });
  }
});

// POST /api/registrations/:id/approve - Approve partnership registration (protected)
router.post('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'organizer');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Check if user is the event organizer
    if (registration.event.organizer.email !== req.civicUser.email) {
      return res.status(403).json({ message: 'Not authorized to approve this registration' });
    }
    
    // Only partnership registrations need approval
    if (registration.type !== 'partner') {
      return res.status(400).json({ message: 'Only partnership registrations require approval' });
    }
    
    const user = await User.findOne({ civicId: req.civicUser.id });
    await registration.approve(user._id, req.body.notes);
    
    // Update event partnership status
    await Event.findByIdAndUpdate(registration.event._id, {
      $set: {
        'registrations.partners.$[elem].status': 'approved',
        'registrations.partners.$[elem].approvedAt': new Date()
      }
    }, {
      arrayFilters: [{ 'elem.userId': registration.user }]
    });
    
    // Update user partnership status
    await User.findByIdAndUpdate(registration.user, {
      $set: {
        'partnershipEvents.$[elem].status': 'approved'
      }
    }, {
      arrayFilters: [{ 'elem.eventId': registration.event._id }]
    });
    
    const updatedRegistration = await Registration.findById(req.params.id)
      .populate('user', 'name email profilePicture')
      .populate('event', 'title startDate location');
    
    res.json({
      message: 'Partnership approved successfully',
      registration: updatedRegistration
    });
  } catch (error) {
    console.error('Registration approval error:', error);
    res.status(500).json({ message: 'Failed to approve registration', error: error.message });
  }
});

// POST /api/registrations/:id/reject - Reject partnership registration (protected)
router.post('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'organizer');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Check if user is the event organizer
    if (registration.event.organizer.email !== req.civicUser.email) {
      return res.status(403).json({ message: 'Not authorized to reject this registration' });
    }
    
    const user = await User.findOne({ civicId: req.civicUser.id });
    await registration.reject(user._id, req.body.reason);
    
    // Update event partnership status
    await Event.findByIdAndUpdate(registration.event._id, {
      $set: {
        'registrations.partners.$[elem].status': 'rejected'
      }
    }, {
      arrayFilters: [{ 'elem.userId': registration.user }]
    });
    
    // Update user partnership status
    await User.findByIdAndUpdate(registration.user, {
      $set: {
        'partnershipEvents.$[elem].status': 'rejected'
      }
    }, {
      arrayFilters: [{ 'elem.eventId': registration.event._id }]
    });
    
    const updatedRegistration = await Registration.findById(req.params.id)
      .populate('user', 'name email profilePicture')
      .populate('event', 'title startDate location');
    
    res.json({
      message: 'Partnership rejected',
      registration: updatedRegistration
    });
  } catch (error) {
    console.error('Registration rejection error:', error);
    res.status(500).json({ message: 'Failed to reject registration', error: error.message });
  }
});

// POST /api/registrations/:id/checkin - Check in user for event (protected)
router.post('/:id/checkin', authMiddleware, async (req, res) => {
  try {
    const { actualRole, hoursContributed } = req.body;
    
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'organizer');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Check if user is the event organizer
    if (registration.event.organizer.email !== req.civicUser.email) {
      return res.status(403).json({ message: 'Not authorized to check in users' });
    }
    
    const organizer = await User.findOne({ civicId: req.civicUser.id });
    await registration.checkIn(organizer._id, actualRole, hoursContributed);
    
    // Update user stats
    if (registration.type === 'volunteer' && hoursContributed) {
      await User.findByIdAndUpdate(registration.user, {
        $inc: { 'stats.totalVolunteerHours': hoursContributed }
      });
    }
    
    const updatedRegistration = await Registration.findById(req.params.id)
      .populate('user', 'name email profilePicture')
      .populate('event', 'title startDate location');
    
    res.json({
      message: 'User checked in successfully',
      registration: updatedRegistration
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Failed to check in user', error: error.message });
  }
});

// POST /api/registrations/:id/feedback - Submit feedback for event (protected)
router.post('/:id/feedback', authMiddleware, async (req, res) => {
  try {
    const { rating, comments, wouldRecommend, improvements } = req.body;
    
    const user = await User.findOne({ civicId: req.civicUser.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    // Check if user owns this registration
    if (registration.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit feedback for this registration' });
    }
    
    // Check if event has ended
    const event = await Event.findById(registration.event);
    if (event.endDate > new Date()) {
      return res.status(400).json({ message: 'Cannot submit feedback before event ends' });
    }
    
    registration.feedback = {
      rating,
      comments,
      wouldRecommend,
      improvements,
      submittedAt: new Date()
    };
    
    await registration.save();
    
    res.json({
      message: 'Feedback submitted successfully',
      registration
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(400).json({ message: 'Failed to submit feedback', error: error.message });
  }
});

module.exports = router;
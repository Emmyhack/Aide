const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Civic Auth user ID
  civicId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User profile information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  profilePicture: {
    type: String,
    default: null
  },
  
  // User preferences and settings
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  interests: [{
    type: String,
    enum: ['Technology', 'Education', 'Healthcare', 'Environment', 'Community Development', 
           'Arts & Culture', 'Sports & Recreation', 'Social Services', 'Business & Entrepreneurship', 
           'Other']
  }],
  
  skills: [String],
  
  bio: {
    type: String,
    maxlength: 500
  },
  
  // User activity tracking
  volunteerEvents: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled', 'no-show'],
      default: 'registered'
    }
  }],
  
  partnershipEvents: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    partnershipType: {
      type: String,
      enum: ['sponsor', 'venue', 'speaker', 'media', 'other'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
      default: 'pending'
    },
    contribution: {
      type: String,
      maxlength: 1000
    },
    fundingAmount: {
      type: Number,
      min: 0
    }
  }],
  
  // User statistics
  stats: {
    totalVolunteerHours: {
      type: Number,
      default: 0
    },
    eventsAttended: {
      type: Number,
      default: 0
    },
    partnershipsCompleted: {
      type: Number,
      default: 0
    },
    impactScore: {
      type: Number,
      default: 0
    }
  },
  
  // Account settings
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    eventReminders: {
      type: Boolean,
      default: true
    },
    partnershipUpdates: {
      type: Boolean,
      default: true
    },
    communityUpdates: {
      type: Boolean,
      default: false
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total events participated
userSchema.virtual('totalEvents').get(function() {
  return this.volunteerEvents.length + this.partnershipEvents.length;
});

// Index for location-based queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Index for search functionality
userSchema.index({ name: 'text', bio: 'text', skills: 'text' });

// Pre-save middleware to update stats
userSchema.pre('save', function(next) {
  if (this.isModified('volunteerEvents') || this.isModified('partnershipEvents')) {
    this.stats.eventsAttended = this.volunteerEvents.filter(event => 
      event.status === 'attended'
    ).length;
    
    this.stats.partnershipsCompleted = this.partnershipEvents.filter(partnership => 
      partnership.status === 'completed'
    ).length;
    
    // Calculate impact score based on participation
    this.stats.impactScore = (this.stats.eventsAttended * 10) + 
                           (this.stats.partnershipsCompleted * 25);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
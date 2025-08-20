const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  // Core registration information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  
  // Registration type
  type: {
    type: String,
    enum: ['volunteer', 'partner'],
    required: true
  },
  
  // Volunteer-specific fields
  volunteerDetails: {
    preferredRole: String,
    skills: [String],
    experience: {
      type: String,
      maxlength: 500
    },
    availability: {
      startTime: Date,
      endTime: Date,
      flexibleSchedule: {
        type: Boolean,
        default: false
      }
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    specialRequirements: {
      type: String,
      maxlength: 300
    },
    tshirtSize: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    }
  },
  
  // Partnership-specific fields
  partnershipDetails: {
    partnershipType: {
      type: String,
      enum: ['sponsor', 'venue', 'speaker', 'media', 'other']
    },
    organizationName: String,
    organizationWebsite: String,
    contactPerson: {
      name: String,
      title: String,
      email: String,
      phone: String
    },
    contribution: {
      description: {
        type: String,
        maxlength: 1000
      },
      value: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      inKind: {
        type: Boolean,
        default: false
      },
      inKindDescription: String
    },
    requirements: {
      type: String,
      maxlength: 500
    },
    expectations: {
      type: String,
      maxlength: 500
    },
    previousPartnerships: [{
      eventName: String,
      year: Number,
      type: String
    }],
    logoUrl: String,
    websiteUrl: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String
    }
  },
  
  // Registration status and workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'waitlisted', 'confirmed', 'attended', 'cancelled', 'no-show'],
    default: 'pending'
  },
  
  // Status history for tracking
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Communication and notes
  notes: {
    user: {
      type: String,
      maxlength: 1000
    },
    organizer: {
      type: String,
      maxlength: 1000
    },
    internal: {
      type: String,
      maxlength: 1000
    }
  },
  
  // Registration form responses
  customResponses: [{
    question: String,
    answer: String,
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'file']
    }
  }],
  
  // Confirmation and check-in
  confirmation: {
    isConfirmed: {
      type: Boolean,
      default: false
    },
    confirmedAt: Date,
    confirmationToken: String,
    remindersSent: {
      type: Number,
      default: 0
    }
  },
  
  checkin: {
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkedInAt: Date,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actualRole: String,
    hoursContributed: Number
  },
  
  // Feedback and evaluation
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      maxlength: 1000
    },
    wouldRecommend: Boolean,
    improvements: {
      type: String,
      maxlength: 500
    },
    submittedAt: Date
  },
  
  // Certificates and recognition
  recognition: {
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificateUrl: String,
    badgesEarned: [String],
    publicRecognition: {
      type: Boolean,
      default: false
    }
  },
  
  // Privacy and consent
  consent: {
    dataProcessing: {
      type: Boolean,
      required: true
    },
    communications: {
      type: Boolean,
      default: true
    },
    photoRelease: {
      type: Boolean,
      default: false
    },
    publicProfile: {
      type: Boolean,
      default: false
    }
  },
  
  // Technical metadata
  registrationSource: {
    type: String,
    enum: ['web', 'mobile', 'api', 'import', 'admin'],
    default: 'web'
  },
  
  ipAddress: String,
  userAgent: String,
  
  // Payment information (for paid events or partnerships)
  payment: {
    required: {
      type: Boolean,
      default: false
    },
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentMethod: String,
    paidAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient querying
registrationSchema.index({ user: 1, event: 1 }, { unique: true });
registrationSchema.index({ event: 1, type: 1, status: 1 });
registrationSchema.index({ user: 1, type: 1, status: 1 });
registrationSchema.index({ createdAt: -1 });

// Virtual fields
registrationSchema.virtual('isActive').get(function() {
  return ['approved', 'confirmed', 'attended'].includes(this.status);
});

registrationSchema.virtual('isPending').get(function() {
  return ['pending', 'waitlisted'].includes(this.status);
});

registrationSchema.virtual('totalValue').get(function() {
  if (this.type === 'partner' && this.partnershipDetails.contribution) {
    return this.partnershipDetails.contribution.value || 0;
  }
  return 0;
});

// Pre-save middleware
registrationSchema.pre('save', function(next) {
  // Add to status history if status changed
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      notes: `Status changed to ${this.status}`
    });
  }
  
  // Auto-confirm volunteer registrations for public events
  if (this.type === 'volunteer' && this.status === 'pending' && this.isNew) {
    this.status = 'approved';
  }
  
  next();
});

// Methods
registrationSchema.methods.approve = function(approvedBy, notes) {
  this.status = 'approved';
  this.statusHistory.push({
    status: 'approved',
    changedAt: new Date(),
    changedBy: approvedBy,
    notes: notes || 'Registration approved'
  });
  return this.save();
};

registrationSchema.methods.reject = function(rejectedBy, reason) {
  this.status = 'rejected';
  this.statusHistory.push({
    status: 'rejected',
    changedAt: new Date(),
    changedBy: rejectedBy,
    notes: reason || 'Registration rejected'
  });
  return this.save();
};

registrationSchema.methods.checkIn = function(checkedInBy, actualRole, hoursContributed) {
  this.checkin.checkedIn = true;
  this.checkin.checkedInAt = new Date();
  this.checkin.checkedInBy = checkedInBy;
  this.checkin.actualRole = actualRole;
  this.checkin.hoursContributed = hoursContributed;
  this.status = 'attended';
  
  return this.save();
};

module.exports = mongoose.model('Registration', registrationSchema);
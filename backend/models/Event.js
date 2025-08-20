const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Basic event information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  shortDescription: {
    type: String,
    required: true,
    maxlength: 300
  },
  
  // Event categorization
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Education', 'Healthcare', 'Environment', 'Community Development', 
           'Arts & Culture', 'Sports & Recreation', 'Social Services', 'Business & Entrepreneurship', 
           'Other']
  },
  
  tags: [String],
  
  // Event logistics
  location: {
    venue: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    isVirtual: {
      type: Boolean,
      default: false
    },
    virtualLink: String
  },
  
  // Event timing
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number, // in hours
    required: true
  },
  
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Organizer information
  organizer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    organization: String,
    website: String,
    logo: String
  },
  
  // Volunteer opportunities
  volunteerOpportunities: {
    isAcceptingVolunteers: {
      type: Boolean,
      default: true
    },
    maxVolunteers: {
      type: Number,
      default: 50
    },
    currentVolunteers: {
      type: Number,
      default: 0
    },
    roles: [{
      title: String,
      description: String,
      skillsRequired: [String],
      count: Number,
      filled: {
        type: Number,
        default: 0
      }
    }],
    requirements: {
      minAge: Number,
      backgroundCheck: {
        type: Boolean,
        default: false
      },
      specificSkills: [String],
      timeCommitment: String
    },
    benefits: [String]
  },
  
  // Partnership opportunities
  partnershipOpportunities: {
    isAcceptingPartners: {
      type: Boolean,
      default: true
    },
    types: [{
      type: {
        type: String,
        enum: ['sponsor', 'venue', 'speaker', 'media', 'other'],
        required: true
      },
      description: String,
      requirements: String,
      benefits: [String],
      fundingRequired: {
        type: Boolean,
        default: false
      },
      suggestedAmount: {
        min: Number,
        max: Number
      },
      maxPartners: Number,
      currentPartners: {
        type: Number,
        default: 0
      }
    }],
    totalFundingGoal: Number,
    currentFunding: {
      type: Number,
      default: 0
    }
  },
  
  // Event media and resources
  media: {
    featuredImage: String,
    gallery: [String],
    videos: [String]
  },
  
  resources: [{
    title: String,
    description: String,
    url: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'image', 'other']
    }
  }],
  
  // Event status and management
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  
  // Registration and tracking
  registrations: {
    volunteers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      registeredAt: {
        type: Date,
        default: Date.now
      },
      role: String,
      status: {
        type: String,
        enum: ['registered', 'confirmed', 'attended', 'cancelled', 'no-show'],
        default: 'registered'
      },
      notes: String
    }],
    
    partners: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
      contribution: String,
      fundingAmount: Number,
      approvedAt: Date,
      notes: String
    }]
  },
  
  // Event statistics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    totalRegistrations: {
      type: Number,
      default: 0
    },
    actualAttendance: Number,
    satisfactionRating: Number,
    impactMetrics: {
      peopleHelped: Number,
      fundsRaised: Number,
      hoursContributed: Number,
      customMetrics: [{
        name: String,
        value: Number,
        unit: String
      }]
    }
  },
  
  // SEO and discovery
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
eventSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date();
});

eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

eventSchema.virtual('isPast').get(function() {
  return this.endDate < new Date();
});

eventSchema.virtual('volunteersNeeded').get(function() {
  return Math.max(0, this.volunteerOpportunities.maxVolunteers - this.volunteerOpportunities.currentVolunteers);
});

eventSchema.virtual('fundingProgress').get(function() {
  if (!this.partnershipOpportunities.totalFundingGoal) return 0;
  return (this.partnershipOpportunities.currentFunding / this.partnershipOpportunities.totalFundingGoal) * 100;
});

// Indexes for efficient querying
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ 'seo.slug': 1 });

// Pre-save middleware to update counters
eventSchema.pre('save', function(next) {
  if (this.isModified('registrations')) {
    this.volunteerOpportunities.currentVolunteers = this.registrations.volunteers.filter(
      reg => ['registered', 'confirmed', 'attended'].includes(reg.status)
    ).length;
    
    // Update partner counts by type
    this.partnershipOpportunities.types.forEach(type => {
      type.currentPartners = this.registrations.partners.filter(
        partner => partner.partnershipType === type.type && 
                  ['approved', 'active', 'completed'].includes(partner.status)
      ).length;
    });
    
    // Update total funding
    this.partnershipOpportunities.currentFunding = this.registrations.partners
      .filter(partner => ['approved', 'active', 'completed'].includes(partner.status))
      .reduce((total, partner) => total + (partner.fundingAmount || 0), 0);
    
    this.stats.totalRegistrations = this.registrations.volunteers.length + 
                                   this.registrations.partners.length;
  }
  next();
});

// Generate slug before saving
eventSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.seo.slug) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
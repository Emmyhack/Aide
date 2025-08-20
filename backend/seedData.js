const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

const sampleEvents = [
  {
    title: "Web3Lagos Community Meetup 2024",
    description: "Join us for the biggest Web3 community gathering in Lagos! This event brings together blockchain developers, crypto enthusiasts, and Web3 innovators from across Nigeria and West Africa. We'll have workshops on DeFi, NFTs, smart contract development, and the future of decentralized technologies. Perfect for both beginners and experienced developers looking to network and learn about the latest trends in Web3.",
    shortDescription: "The biggest Web3 community gathering in Lagos with workshops on DeFi, NFTs, and blockchain development.",
    category: "Technology",
    tags: ["Web3", "Blockchain", "DeFi", "NFT", "Cryptocurrency", "Lagos", "Nigeria", "Networking"],
    location: {
      venue: "Lagos Continental Hotel",
      address: {
        street: "52A Kofo Abayomi Street",
        city: "Lagos",
        state: "Lagos State",
        country: "Nigeria",
        zipCode: "101241"
      },
      coordinates: {
        lat: 6.4474,
        lng: 3.4653
      },
      isVirtual: false
    },
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 hours later
    duration: 8,
    timezone: "Africa/Lagos",
    organizer: {
      name: "Web3Lagos Community",
      email: "hello@web3lagos.com",
      phone: "+234-800-WEB3-LAG",
      organization: "Web3Lagos",
      website: "https://web3lagos.com",
      logo: "https://web3lagos.com/logo.png"
    },
    volunteerOpportunities: {
      isAcceptingVolunteers: true,
      maxVolunteers: 50,
      roles: [
        {
          title: "Registration Assistant",
          description: "Help with attendee check-in and registration",
          skillsRequired: ["Customer Service", "Organization"],
          count: 10
        },
        {
          title: "Technical Support",
          description: "Assist with AV equipment and live streaming",
          skillsRequired: ["Technical Skills", "Problem Solving"],
          count: 5
        },
        {
          title: "Workshop Facilitator",
          description: "Help facilitate breakout sessions and workshops",
          skillsRequired: ["Web3 Knowledge", "Communication", "Leadership"],
          count: 8
        },
        {
          title: "Social Media Coordinator",
          description: "Document event and manage social media presence",
          skillsRequired: ["Social Media", "Photography", "Content Creation"],
          count: 3
        }
      ],
      requirements: {
        minAge: 18,
        backgroundCheck: false,
        specificSkills: ["Communication", "Enthusiasm for Web3"],
        timeCommitment: "Full day commitment required"
      },
      benefits: ["Free lunch", "Web3Lagos t-shirt", "Networking opportunities", "Certificate of participation"]
    },
    partnershipOpportunities: {
      isAcceptingPartners: true,
      types: [
        {
          type: "sponsor",
          description: "Sponsor the event and get brand visibility",
          requirements: "Companies in tech, blockchain, or finance sectors",
          benefits: ["Logo on all marketing materials", "Speaking slot", "Booth space", "Attendee list"],
          fundingRequired: true,
          suggestedAmount: { min: 500000, max: 2000000 }, // NGN
          maxPartners: 5
        },
        {
          type: "venue",
          description: "Provide venue space for the event",
          requirements: "Venue that can accommodate 300+ people",
          benefits: ["Brand recognition", "Networking opportunities"],
          fundingRequired: false,
          maxPartners: 1
        },
        {
          type: "speaker",
          description: "Share expertise in Web3 technologies",
          requirements: "Proven experience in blockchain/Web3",
          benefits: ["Industry recognition", "Networking", "Content promotion"],
          fundingRequired: false,
          maxPartners: 12
        },
        {
          type: "media",
          description: "Media coverage and promotion",
          requirements: "Tech or blockchain focused media outlets",
          benefits: ["Exclusive interviews", "Content access", "Press credentials"],
          fundingRequired: false,
          maxPartners: 8
        }
      ],
      totalFundingGoal: 5000000 // NGN
    },
    media: {
      featuredImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600",
        "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600"
      ]
    },
    status: "published",
    visibility: "public"
  },
  
  {
    title: "Developers Meetup: AI & Machine Learning Workshop",
    description: "An intensive workshop focused on practical applications of AI and Machine Learning in modern software development. This meetup is designed for developers who want to dive deep into AI/ML technologies, learn about the latest frameworks, and build real-world applications. We'll cover topics including neural networks, natural language processing, computer vision, and deployment strategies. Participants will work on hands-on projects and leave with practical skills they can immediately apply in their work.",
    shortDescription: "Intensive AI & ML workshop for developers with hands-on projects and practical applications.",
    category: "Technology",
    tags: ["AI", "Machine Learning", "Python", "TensorFlow", "Neural Networks", "Developers", "Workshop"],
    location: {
      venue: "TechHub Innovation Center",
      address: {
        street: "123 Innovation Drive",
        city: "San Francisco",
        state: "California",
        country: "United States",
        zipCode: "94105"
      },
      coordinates: {
        lat: 37.7749,
        lng: -122.4194
      },
      isVirtual: true,
      virtualLink: "https://zoom.us/j/aimlworkshop2024"
    },
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours later
    duration: 6,
    timezone: "America/Los_Angeles",
    organizer: {
      name: "AI Developers Community",
      email: "organizers@aidevs.community",
      phone: "+1-555-AI-DEVS",
      organization: "AI Developers Community",
      website: "https://aidevs.community",
      logo: "https://aidevs.community/logo.png"
    },
    volunteerOpportunities: {
      isAcceptingVolunteers: true,
      maxVolunteers: 25,
      roles: [
        {
          title: "Workshop Assistant",
          description: "Help participants with coding exercises and troubleshooting",
          skillsRequired: ["Python", "Machine Learning", "Teaching"],
          count: 8
        },
        {
          title: "Technical Moderator",
          description: "Manage online sessions and technical issues",
          skillsRequired: ["Technical Skills", "Communication", "Problem Solving"],
          count: 4
        },
        {
          title: "Content Creator",
          description: "Create tutorials and documentation",
          skillsRequired: ["Writing", "Technical Documentation", "AI/ML Knowledge"],
          count: 3
        }
      ],
      requirements: {
        minAge: 21,
        backgroundCheck: false,
        specificSkills: ["Programming experience", "AI/ML basics"],
        timeCommitment: "6 hours workshop + 2 hours prep"
      },
      benefits: ["Certificate", "Free course materials", "Industry networking", "Portfolio projects"]
    },
    partnershipOpportunities: {
      isAcceptingPartners: true,
      types: [
        {
          type: "sponsor",
          description: "Sponsor AI/ML tools and resources for participants",
          requirements: "AI/ML companies or cloud providers",
          benefits: ["Brand exposure", "Talent pipeline access", "Speaking opportunity"],
          fundingRequired: true,
          suggestedAmount: { min: 2000, max: 10000 }, // USD
          maxPartners: 3
        },
        {
          type: "speaker",
          description: "Share expertise in AI/ML industry applications",
          requirements: "Senior AI/ML engineers or researchers",
          benefits: ["Industry recognition", "Networking", "Thought leadership"],
          fundingRequired: false,
          maxPartners: 6
        }
      ],
      totalFundingGoal: 15000 // USD
    },
    media: {
      featuredImage: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"
      ]
    },
    status: "published",
    visibility: "public"
  },
  
  {
    title: "Global Climate Action Summit 2024",
    description: "Join environmental leaders, activists, and changemakers from around the world for a comprehensive summit focused on climate action and sustainable development. This three-day event will feature keynote presentations from renowned climate scientists, interactive workshops on sustainable practices, policy discussions, and networking opportunities. We'll address critical issues including renewable energy, carbon reduction strategies, environmental justice, and community-based climate solutions. Perfect for environmental professionals, students, activists, and anyone passionate about creating a sustainable future.",
    shortDescription: "Three-day global summit on climate action with world leaders, workshops, and sustainable solutions.",
    category: "Environment",
    tags: ["Climate Change", "Sustainability", "Environment", "Renewable Energy", "Global Summit", "Activism"],
    location: {
      venue: "Copenhagen Climate Center",
      address: {
        street: "Ørestads Boulevard 108",
        city: "Copenhagen",
        state: "Capital Region",
        country: "Denmark",
        zipCode: "2300"
      },
      coordinates: {
        lat: 55.6761,
        lng: 12.5683
      },
      isVirtual: false
    },
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    endDate: new Date(Date.now() + 47 * 24 * 60 * 60 * 1000), // 3 days later
    duration: 72,
    timezone: "Europe/Copenhagen",
    organizer: {
      name: "Climate Action Network International",
      email: "summit@climateaction.org",
      phone: "+45-33-12-34-56",
      organization: "Climate Action Network",
      website: "https://climateactionnetwork.org",
      logo: "https://climateactionnetwork.org/logo.png"
    },
    volunteerOpportunities: {
      isAcceptingVolunteers: true,
      maxVolunteers: 200,
      roles: [
        {
          title: "Registration Coordinator",
          description: "Manage attendee registration and welcome processes",
          skillsRequired: ["Organization", "Customer Service", "Multilingual preferred"],
          count: 30
        },
        {
          title: "Workshop Facilitator",
          description: "Assist with breakout sessions and group activities",
          skillsRequired: ["Leadership", "Environmental Knowledge", "Communication"],
          count: 40
        },
        {
          title: "Translation Assistant",
          description: "Provide language support for international attendees",
          skillsRequired: ["Multilingual", "Environmental Terminology"],
          count: 25
        },
        {
          title: "Sustainability Coordinator",
          description: "Ensure event follows sustainable practices",
          skillsRequired: ["Sustainability Knowledge", "Project Management"],
          count: 15
        },
        {
          title: "Media & Documentation",
          description: "Document sessions and manage social media",
          skillsRequired: ["Photography", "Social Media", "Content Creation"],
          count: 20
        }
      ],
      requirements: {
        minAge: 18,
        backgroundCheck: true,
        specificSkills: ["Passion for environmental issues", "Commitment to sustainability"],
        timeCommitment: "3 full days with optional prep sessions"
      },
      benefits: ["Accommodation support", "Meals provided", "Certificate", "Networking", "Learning opportunities"]
    },
    partnershipOpportunities: {
      isAcceptingPartners: true,
      types: [
        {
          type: "sponsor",
          description: "Support global climate action initiatives",
          requirements: "Organizations committed to sustainability",
          benefits: ["Global brand exposure", "Sustainability credentials", "Networking", "Speaking slots"],
          fundingRequired: true,
          suggestedAmount: { min: 10000, max: 100000 }, // USD
          maxPartners: 10
        },
        {
          type: "venue",
          description: "Provide sustainable venue spaces",
          requirements: "Eco-certified venues with green practices",
          benefits: ["Sustainability recognition", "Industry networking"],
          fundingRequired: false,
          maxPartners: 3
        },
        {
          type: "speaker",
          description: "Share climate expertise and solutions",
          requirements: "Climate scientists, policy experts, or activists",
          benefits: ["Global platform", "Thought leadership", "Networking"],
          fundingRequired: false,
          maxPartners: 50
        },
        {
          type: "media",
          description: "Provide media coverage and amplification",
          requirements: "Environmental or mainstream media outlets",
          benefits: ["Exclusive access", "Interview opportunities", "Content rights"],
          fundingRequired: false,
          maxPartners: 15
        }
      ],
      totalFundingGoal: 500000 // USD
    },
    media: {
      featuredImage: "https://images.unsplash.com/photo-1569163139394-de44cb5894b4?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600"
      ]
    },
    status: "published",
    visibility: "public"
  },
  
  {
    title: "Community Health & Wellness Fair",
    description: "A comprehensive community health fair focused on promoting wellness, preventive care, and health education. This event brings together healthcare professionals, wellness experts, and community organizations to provide free health screenings, educational workshops, fitness demonstrations, and wellness resources. We'll have stations for blood pressure checks, diabetes screening, mental health awareness, nutrition counseling, and fitness assessments. The fair aims to make healthcare accessible to underserved communities and promote healthy lifestyle choices for all ages.",
    shortDescription: "Free community health fair with screenings, wellness workshops, and healthcare resources.",
    category: "Healthcare",
    tags: ["Healthcare", "Community Health", "Wellness", "Free Screenings", "Prevention", "Mental Health"],
    location: {
      venue: "Central Community Center",
      address: {
        street: "456 Community Way",
        city: "Atlanta",
        state: "Georgia",
        country: "United States",
        zipCode: "30309"
      },
      coordinates: {
        lat: 33.7490,
        lng: -84.3880
      },
      isVirtual: false
    },
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 hours later
    duration: 8,
    timezone: "America/New_York",
    organizer: {
      name: "Community Health Alliance",
      email: "events@communityhealthalliance.org",
      phone: "+1-404-555-HEAL",
      organization: "Community Health Alliance",
      website: "https://communityhealthalliance.org",
      logo: "https://communityhealthalliance.org/logo.png"
    },
    volunteerOpportunities: {
      isAcceptingVolunteers: true,
      maxVolunteers: 75,
      roles: [
        {
          title: "Health Screening Assistant",
          description: "Assist healthcare professionals with basic screenings",
          skillsRequired: ["Healthcare background preferred", "Patient interaction"],
          count: 20
        },
        {
          title: "Registration & Information",
          description: "Help attendees navigate the fair and register for services",
          skillsRequired: ["Customer Service", "Organization", "Bilingual preferred"],
          count: 15
        },
        {
          title: "Wellness Workshop Coordinator",
          description: "Support fitness and wellness demonstrations",
          skillsRequired: ["Fitness knowledge", "Group coordination"],
          count: 10
        },
        {
          title: "Community Outreach",
          description: "Connect attendees with ongoing health resources",
          skillsRequired: ["Community knowledge", "Resource navigation"],
          count: 12
        },
        {
          title: "Setup & Logistics",
          description: "Help with event setup, breakdown, and logistics",
          skillsRequired: ["Physical ability", "Teamwork", "Reliability"],
          count: 18
        }
      ],
      requirements: {
        minAge: 16,
        backgroundCheck: true,
        specificSkills: ["Compassion", "Reliability", "Cultural sensitivity"],
        timeCommitment: "Full day or half-day shifts available"
      },
      benefits: ["Health fair t-shirt", "Free health screenings", "Community service hours", "Healthcare networking"]
    },
    partnershipOpportunities: {
      isAcceptingPartners: true,
      types: [
        {
          type: "sponsor",
          description: "Support community health initiatives",
          requirements: "Healthcare organizations, local businesses",
          benefits: ["Community recognition", "Brand visibility", "CSR fulfillment"],
          fundingRequired: true,
          suggestedAmount: { min: 1000, max: 25000 }, // USD
          maxPartners: 8
        },
        {
          type: "venue",
          description: "Provide space for health screenings and workshops",
          requirements: "Large, accessible community spaces",
          benefits: ["Community partnership recognition"],
          fundingRequired: false,
          maxPartners: 2
        },
        {
          type: "speaker",
          description: "Provide health education presentations",
          requirements: "Licensed healthcare professionals",
          benefits: ["Community service recognition", "Professional networking"],
          fundingRequired: false,
          maxPartners: 15
        }
      ],
      totalFundingGoal: 50000 // USD
    },
    media: {
      featuredImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600",
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600"
      ]
    },
    status: "published",
    visibility: "public"
  },
  
  {
    title: "Youth Arts & Culture Festival",
    description: "A vibrant celebration of youth creativity and cultural expression featuring young artists, musicians, dancers, and performers from diverse backgrounds. This festival provides a platform for emerging talent to showcase their work, learn from established artists, and connect with their peers. The event includes live performances, art exhibitions, interactive workshops, cultural food vendors, and mentorship opportunities. We aim to foster creativity, cultural understanding, and artistic development among young people while celebrating the rich diversity of our community.",
    shortDescription: "Vibrant youth festival celebrating creativity, culture, and emerging talent with performances and workshops.",
    category: "Arts & Culture",
    tags: ["Youth", "Arts", "Culture", "Music", "Dance", "Creative Expression", "Community", "Festival"],
    location: {
      venue: "Riverside Cultural Park",
      address: {
        street: "789 River Street",
        city: "Portland",
        state: "Oregon",
        country: "United States",
        zipCode: "97205"
      },
      coordinates: {
        lat: 45.5152,
        lng: -122.6784
      },
      isVirtual: false
    },
    startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
    endDate: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000), // 2 days later
    duration: 16,
    timezone: "America/Los_Angeles",
    organizer: {
      name: "Youth Arts Collective",
      email: "festival@youthartscollective.org",
      phone: "+1-503-555-ARTS",
      organization: "Youth Arts Collective",
      website: "https://youthartscollective.org",
      logo: "https://youthartscollective.org/logo.png"
    },
    volunteerOpportunities: {
      isAcceptingVolunteers: true,
      maxVolunteers: 60,
      roles: [
        {
          title: "Stage Manager Assistant",
          description: "Help coordinate performances and stage logistics",
          skillsRequired: ["Event coordination", "Time management", "Communication"],
          count: 8
        },
        {
          title: "Workshop Facilitator",
          description: "Assist with arts and culture workshops",
          skillsRequired: ["Arts background", "Youth mentoring", "Teaching"],
          count: 15
        },
        {
          title: "Artist Liaison",
          description: "Support performing artists and exhibitors",
          skillsRequired: ["Artist relations", "Problem solving", "Empathy"],
          count: 12
        },
        {
          title: "Community Engagement",
          description: "Welcome families and engage with festival attendees",
          skillsRequired: ["Customer service", "Cultural awareness", "Enthusiasm"],
          count: 20
        },
        {
          title: "Documentation Team",
          description: "Capture festival moments through photography and video",
          skillsRequired: ["Photography", "Video", "Social media"],
          count: 5
        }
      ],
      requirements: {
        minAge: 16,
        backgroundCheck: true,
        specificSkills: ["Passion for arts", "Youth-friendly approach", "Cultural sensitivity"],
        timeCommitment: "Weekend commitment, flexible shifts"
      },
      benefits: ["Festival t-shirt", "Free meals", "Artist meet & greets", "Portfolio building", "Community service hours"]
    },
    partnershipOpportunities: {
      isAcceptingPartners: true,
      types: [
        {
          type: "sponsor",
          description: "Support youth arts development and cultural programming",
          requirements: "Arts organizations, cultural institutions, local businesses",
          benefits: ["Brand visibility", "Community engagement", "Youth program support"],
          fundingRequired: true,
          suggestedAmount: { min: 2500, max: 20000 }, // USD
          maxPartners: 6
        },
        {
          type: "venue",
          description: "Provide performance or exhibition spaces",
          requirements: "Suitable spaces for arts performances and displays",
          benefits: ["Cultural partnership recognition", "Community visibility"],
          fundingRequired: false,
          maxPartners: 4
        },
        {
          type: "speaker",
          description: "Mentor young artists and share industry insights",
          requirements: "Established artists, cultural leaders, arts educators",
          benefits: ["Community impact", "Mentorship recognition", "Networking"],
          fundingRequired: false,
          maxPartners: 20
        },
        {
          type: "media",
          description: "Document and promote youth arts initiatives",
          requirements: "Arts and culture media, community publications",
          benefits: ["Exclusive content access", "Cultural story rights"],
          fundingRequired: false,
          maxPartners: 8
        }
      ],
      totalFundingGoal: 75000 // USD
    },
    media: {
      featuredImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=600",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600"
      ]
    },
    status: "published",
    visibility: "public"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer-hub');
    console.log('Connected to MongoDB');
    
    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');
    
    // Insert sample events
    const insertedEvents = await Event.insertMany(sampleEvents);
    console.log(`Inserted ${insertedEvents.length} sample events`);
    
    // Display created events
    insertedEvents.forEach(event => {
      console.log(`- ${event.title} (${event.category})`);
    });
    
    console.log('\nDatabase seeded successfully!');
    console.log('You can now start the server and see these events in the application.');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleEvents };
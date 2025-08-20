# Community Volunteer and Partner Hub

An award-winning web application that connects communities through meaningful volunteer opportunities and partnerships worldwide. Built with React, Node.js, and secured by Civic Auth for seamless, trustworthy authentication.

## Overview

The Community Volunteer and Partner Hub is a comprehensive platform designed to bridge the gap between volunteers, event organizers, and potential partners. Users can discover volunteer opportunities, register for events, and form partnerships to create positive community impact.

### Key Highlights

- **Secure Authentication**: Powered by Civic Auth for Web2-friendly login via email or social accounts
- **Comprehensive Event Management**: Full-featured event discovery, registration, and management
- **Dual Opportunity Types**: Support for both volunteer and partnership registrations
- **Responsive Design**: Beautiful, mobile-first UI built with TailwindCSS
- **Real-time Dashboard**: Personal dashboard with activity tracking and impact metrics
- **Global Reach**: Support for events worldwide with location-based filtering

## Features

### For Volunteers
- Browse volunteer opportunities by category, location, and date
- Secure registration with Civic Auth
- Personal dashboard with activity tracking
- Event reminders and notifications
- Impact score and achievement system

### For Event Organizers
- Create and manage events with detailed descriptions
- Set up volunteer roles and partnership opportunities
- Manage registrations and approvals
- Track event analytics and impact metrics

### For Partners
- Discover partnership opportunities
- Multiple partnership types: sponsorship, venue, speaker, media
- Funding and in-kind contribution options
- Partnership approval workflow

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks and context
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Civic Auth Web2 SDK** - Secure authentication system

### Deployment
- **Vercel** - Serverless deployment platform
- **MongoDB Atlas** - Cloud database hosting

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Civic Auth account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd community-volunteer-hub
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**
   
   **Backend (.env)**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/volunteer-hub
   FRONTEND_URL=http://localhost:5173
   CIVIC_AUTH_CLIENT_ID=your_civic_auth_client_id
   CIVIC_AUTH_CLIENT_SECRET=your_civic_auth_client_secret
   JWT_SECRET=your_super_secret_jwt_key
   ```
   
   **Frontend (.env)**
   ```bash
   cd frontend
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_CIVIC_AUTH_CLIENT_ID=your_civic_auth_client_id
   VITE_CIVIC_AUTH_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

4. **Database Setup**
   
   Start MongoDB locally or use MongoDB Atlas. Then seed the database with sample data:
   ```bash
   cd backend
   node seedData.js
   ```

5. **Start Development Servers**
   
   **Backend (Terminal 1)**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend (Terminal 2)**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## Civic Auth Integration

### Setup Process

1. **Create Civic Auth Account**
   - Visit [auth.civic.com](https://auth.civic.com)
   - Create a new application
   - Note your Client ID and Client Secret

2. **Configure Application**
   - Set redirect URI: `http://localhost:5173/auth/callback` (development)
   - Enable email and social login providers
   - Configure scopes: `email`, `profile`

3. **Update Environment Variables**
   ```env
   # Backend
   CIVIC_AUTH_CLIENT_ID=your_client_id
   CIVIC_AUTH_CLIENT_SECRET=your_client_secret
   
   # Frontend
   VITE_CIVIC_AUTH_CLIENT_ID=your_client_id
   ```

### Demo Mode

For development and demonstration purposes, the application includes demo login functionality:

- Demo Volunteer Account
- Demo Organizer Account  
- Demo Partner Account

**Note**: Remove demo functionality in production builds.

## Project Structure

```
community-volunteer-hub/
├── backend/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── seedData.js       # Database seeding
│   └── server.js         # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── hooks/        # Custom hooks
│   │   └── services/     # API services
│   └── public/           # Static assets
└── README.md            # This file
```

## API Documentation

### Authentication Endpoints

```
POST /api/auth/login      # Login with Civic Auth
POST /api/auth/logout     # Logout user
GET  /api/auth/verify     # Verify authentication
```

### Events Endpoints

```
GET    /api/events              # Get all events (with filtering)
GET    /api/events/:id          # Get event by ID
POST   /api/events              # Create event (auth required)
PUT    /api/events/:id          # Update event (auth required)
DELETE /api/events/:id          # Delete event (auth required)
```

### Users Endpoints

```
GET    /api/users/profile       # Get user profile (auth required)
PUT    /api/users/profile       # Update profile (auth required)
GET    /api/users/dashboard     # Get dashboard data (auth required)
```

### Registrations Endpoints

```
POST   /api/registrations           # Create registration (auth required)
GET    /api/registrations/:id       # Get registration (auth required)
PUT    /api/registrations/:id       # Update registration (auth required)
DELETE /api/registrations/:id       # Cancel registration (auth required)
```

## Deployment

### Vercel Deployment

1. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy from project root
   vercel
   ```

2. **Environment Variables**
   Set the following environment variables in Vercel dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   CIVIC_AUTH_CLIENT_ID=your_civic_auth_client_id
   CIVIC_AUTH_CLIENT_SECRET=your_civic_auth_client_secret
   JWT_SECRET=your_production_jwt_secret
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   ```

## Sample Data

The application comes with rich sample data including:

- **Web3Lagos Community Meetup 2024** - Technology event in Lagos, Nigeria
- **Developers Meetup: AI & Machine Learning Workshop** - Virtual tech workshop
- **Global Climate Action Summit 2024** - Environmental event in Copenhagen
- **Community Health & Wellness Fair** - Healthcare event in Atlanta
- **Youth Arts & Culture Festival** - Arts event in Portland

Each event includes:
- Detailed descriptions and requirements
- Multiple volunteer roles and partnership opportunities
- Location information and logistics
- Media galleries and organizer details
- Registration workflows and approval processes

## Security Features

- Civic Auth integration for secure authentication
- JWT token validation
- CORS configuration
- Input validation and sanitization
- Environment variable protection
- XSS protection through React

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Contact the development team

---

**Built with ❤️ for community impact and global change.**
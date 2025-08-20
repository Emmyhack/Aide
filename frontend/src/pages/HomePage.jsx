import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, apiHelpers } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [eventsResponse, statsResponse] = await Promise.all([
          eventsAPI.getAll({ limit: 6, sortBy: 'startDate', sortOrder: 'asc' }),
          eventsAPI.getStats()
        ]);

        setFeaturedEvents(eventsResponse.data.events);
        setStats(statsResponse.data.overview);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Find Volunteer Opportunities',
      description: 'Discover meaningful volunteer opportunities in your community and around the world.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8m0 0V4a2 2 0 012-2h4a2 2 0 012 2v2H8z" />
        </svg>
      ),
      title: 'Partner with Events',
      description: 'Support community initiatives through sponsorship, venue partnerships, or expertise sharing.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Secure Authentication',
      description: 'Login securely with Civic Auth using your email or social accounts for a trusted experience.',
    },
  ];

  const categories = [
    { name: 'Technology', count: '45+ events', color: 'bg-blue-100 text-blue-800' },
    { name: 'Education', count: '38+ events', color: 'bg-green-100 text-green-800' },
    { name: 'Healthcare', count: '29+ events', color: 'bg-red-100 text-red-800' },
    { name: 'Environment', count: '52+ events', color: 'bg-emerald-100 text-emerald-800' },
    { name: 'Community Development', count: '41+ events', color: 'bg-purple-100 text-purple-800' },
    { name: 'Arts & Culture', count: '33+ events', color: 'bg-pink-100 text-pink-800' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container-custom py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Connect. Volunteer. 
              <span className="block text-yellow-300">Make an Impact.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
              Join a global community of changemakers. Find volunteer opportunities, 
              partner with events, and create positive change in communities worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events" className="btn-primary text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100">
                Explore Events
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn-secondary text-lg px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats bar */}
        {stats && (
          <div className="relative bg-white bg-opacity-10 backdrop-blur-sm border-t border-white border-opacity-20">
            <div className="container-custom py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-yellow-300">{stats.totalEvents || 0}</div>
                  <div className="text-sm text-gray-200">Active Events</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-300">{stats.totalVolunteers || 0}</div>
                  <div className="text-sm text-gray-200">Volunteers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-300">{stats.totalPartners || 0}</div>
                  <div className="text-sm text-gray-200">Partners</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-300">{stats.upcomingEvents || 0}</div>
                  <div className="text-sm text-gray-200">Upcoming</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How VolunteerHub Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes it easy to find, join, and support community initiatives 
              that matter to you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-xl text-gray-600">
              Find opportunities that match your interests and skills
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/events?category=${encodeURIComponent(category.name)}`}
                className="card p-6 text-center hover:shadow-lg transition-shadow group"
              >
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-3 ${category.color}`}>
                  {category.name}
                </div>
                <div className="text-sm text-gray-500 group-hover:text-gray-700">
                  {category.count}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-gray-600">
              Upcoming opportunities to make a difference
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <div key={event._id} className="card overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={event.media?.featuredImage || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400'}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`badge badge-blue`}>
                        {event.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(event.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {event.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {event.location?.city}, {event.location?.country}
                      </div>
                      <Link
                        to={`/events/${event._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Learn more →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/events" className="btn-primary text-lg px-8 py-3">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Join thousands of volunteers and partners who are already creating 
            positive change in communities around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-primary bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                  Sign Up Now
                </Link>
                <Link to="/events" className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
                  Browse Events
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
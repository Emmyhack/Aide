import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { eventsAPI, apiHelpers } from '../services/api';
import LoadingSpinner, { InlineLoader } from '../components/LoadingSpinner';

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || 'all',
    sortBy: searchParams.get('sortBy') || 'startDate',
    sortOrder: searchParams.get('sortOrder') || 'asc',
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await eventsAPI.getCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page,
        limit: 12,
        ...filters,
      };

      // Clean up params
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === '') {
          delete params[key];
        }
      });

      const response = await eventsAPI.getAll(params);
      const { events: newEvents, pagination: newPagination } = response.data;

      if (append) {
        setEvents(prev => [...prev, ...newEvents]);
      } else {
        setEvents(newEvents);
      }
      
      setPagination(newPagination);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch events when filters change
  useEffect(() => {
    fetchEvents(1, false);
  }, [fetchEvents]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLoadMore = () => {
    if (pagination?.hasNext) {
      fetchEvents(pagination.currentPage + 1, true);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      location: '',
      type: 'all',
      sortBy: 'startDate',
      sortOrder: 'asc',
    });
  };

  const getEventTypeColor = (event) => {
    const hasVolunteers = event.volunteerOpportunities?.isAcceptingVolunteers;
    const hasPartners = event.partnershipOpportunities?.isAcceptingPartners;
    
    if (hasVolunteers && hasPartners) return 'bg-purple-100 text-purple-800';
    if (hasVolunteers) return 'bg-blue-100 text-blue-800';
    if (hasPartners) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getEventTypeText = (event) => {
    const hasVolunteers = event.volunteerOpportunities?.isAcceptingVolunteers;
    const hasPartners = event.partnershipOpportunities?.isAcceptingPartners;
    
    if (hasVolunteers && hasPartners) return 'Both';
    if (hasVolunteers) return 'Volunteers';
    if (hasPartners) return 'Partners';
    return 'Closed';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Volunteer & Partnership Opportunities
              </h1>
              <p className="mt-2 text-gray-600">
                Discover meaningful ways to contribute to your community
              </p>
            </div>
            
            {pagination && (
              <div className="mt-4 lg:mt-0 text-sm text-gray-500">
                Showing {((pagination.currentPage - 1) * 12) + 1}-{Math.min(pagination.currentPage * 12, pagination.totalEvents)} of {pagination.totalEvents} events
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search events
                  </label>
                  <input
                    type="text"
                    id="search"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Event title, description..."
                    className="input"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input"
                  >
                    <option value="all">All categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="City, state, country..."
                    className="input"
                  />
                </div>

                {/* Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Opportunity type
                  </label>
                  <select
                    id="type"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input"
                  >
                    <option value="all">All types</option>
                    <option value="volunteer">Volunteer opportunities</option>
                    <option value="partnership">Partnership opportunities</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </label>
                  <select
                    id="sortBy"
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                    className="input"
                  >
                    <option value="startDate-asc">Date (earliest first)</option>
                    <option value="startDate-desc">Date (latest first)</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <InlineLoader message="Loading events..." />
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or filters.
                </p>
                <div className="mt-6">
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event._id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={event.media?.featuredImage || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400'}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="badge badge-blue">
                            {event.category}
                          </span>
                          <span className={`badge ${getEventTypeColor(event)}`}>
                            {getEventTypeText(event)}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {event.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {event.shortDescription}
                        </p>
                        
                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(event.startDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.location?.city}, {event.location?.country}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            by {event.organizer?.name}
                          </div>
                          <Link
                            to={`/events/${event._id}`}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {pagination?.hasNext && (
                  <div className="text-center mt-12">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="btn-secondary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Loading more...
                        </>
                      ) : (
                        'Load More Events'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
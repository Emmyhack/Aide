import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, registrationsAPI, apiHelpers } from '../services/api';
import LoadingSpinner, { InlineLoader } from '../components/LoadingSpinner';

const EventDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationType, setRegistrationType] = useState('volunteer');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsAPI.getById(id);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegistration = async (type) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = `/login?from=${window.location.pathname}`;
      return;
    }

    setRegistering(true);
    try {
      const registrationData = {
        eventId: event._id,
        type,
        consent: {
          dataProcessing: true,
          communications: true,
        }
      };

      await registrationsAPI.create(registrationData);
      alert(`Successfully registered as ${type}!`);
      setShowRegistrationModal(false);
    } catch (error) {
      const errorData = apiHelpers.handleError(error);
      alert(errorData.message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <InlineLoader message="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Event not found</h3>
          <Link to="/events" className="btn-primary mt-4">Back to Events</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={event.media?.featuredImage || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200'}
          alt={event.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-custom">
            <div className="max-w-4xl">
              <div className="flex items-center space-x-2 mb-4">
                <span className="badge badge-blue">{event.category}</span>
                <span className="text-white text-sm">
                  by {event.organizer?.name}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {event.title}
              </h1>
              <p className="text-xl text-gray-200 mb-6">
                {event.shortDescription}
              </p>
              <div className="flex items-center space-x-6 text-white">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location?.city}, {event.location?.country}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Event</h2>
              <div className="prose max-w-none text-gray-600">
                {event.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Volunteer Opportunities */}
            {event.volunteerOpportunities?.isAcceptingVolunteers && (
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Opportunities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.volunteerOpportunities.roles?.map((role, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{role.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{role.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {role.filled || 0}/{role.count} filled
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${((role.filled || 0) / role.count) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partnership Opportunities */}
            {event.partnershipOpportunities?.isAcceptingPartners && (
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Partnership Opportunities</h2>
                <div className="space-y-4">
                  {event.partnershipOpportunities.types?.map((type, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 capitalize">{type.type}</h3>
                        <span className="badge badge-green">
                          {type.currentPartners || 0}/{type.maxPartners || '∞'} partners
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                      {type.fundingRequired && type.suggestedAmount && (
                        <p className="text-sm text-green-600">
                          Suggested funding: ${type.suggestedAmount.min?.toLocaleString()} - ${type.suggestedAmount.max?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Join This Event</h3>
              
              <div className="space-y-4">
                {event.volunteerOpportunities?.isAcceptingVolunteers && (
                  <button
                    onClick={() => {
                      setRegistrationType('volunteer');
                      setShowRegistrationModal(true);
                    }}
                    className="btn-primary w-full"
                    disabled={registering}
                  >
                    {registering ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Register as Volunteer
                  </button>
                )}
                
                {event.partnershipOpportunities?.isAcceptingPartners && (
                  <button
                    onClick={() => {
                      setRegistrationType('partner');
                      setShowRegistrationModal(true);
                    }}
                    className="btn-success w-full"
                    disabled={registering}
                  >
                    {registering ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Become a Partner
                  </button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{event.duration} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Volunteers needed:</span>
                  <span>{event.volunteerOpportunities?.maxVolunteers - (event.volunteerOpportunities?.currentVolunteers || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Event views:</span>
                  <span>{event.stats?.views || 0}</span>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Organizer</h3>
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {event.organizer?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{event.organizer?.name}</p>
                  {event.organizer?.organization && (
                    <p className="text-sm text-gray-500">{event.organizer.organization}</p>
                  )}
                  {event.organizer?.website && (
                    <a 
                      href={event.organizer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Visit website →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Register as {registrationType === 'volunteer' ? 'Volunteer' : 'Partner'}
            </h3>
            <p className="text-gray-600 mb-6">
              {registrationType === 'volunteer' 
                ? 'You\'re about to register as a volunteer for this event.'
                : 'You\'re about to register as a partner for this event.'
              }
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleRegistration(registrationType)}
                disabled={registering}
                className="btn-primary flex-1"
              >
                {registering ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Confirm Registration
              </button>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="btn-secondary flex-1"
                disabled={registering}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
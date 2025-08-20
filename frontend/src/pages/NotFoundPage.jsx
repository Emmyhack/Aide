import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.5a7.962 7.962 0 01-5.657-2.343 7.963 7.963 0 010-11.314A7.963 7.963 0 0112 4.5c2.206 0 4.206.896 5.657 2.343a7.963 7.963 0 010 11.314z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-6xl font-extrabold text-gray-900">404</h2>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">Page not found</h3>
          <p className="mt-4 text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-8 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              to="/"
              className="btn-primary"
            >
              Go back home
            </Link>
            <Link
              to="/events"
              className="btn-secondary"
            >
              Browse events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
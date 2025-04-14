import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <svg
            className="mx-auto h-40 w-40 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Go Back
          </button>
          <Link to="/" className="btn-primary">
            <i className="fas fa-home mr-2"></i>
            Return Home
          </Link>
        </div>

        {/* Help Links */}
        <div className="mt-8 space-y-2 text-sm text-gray-500">
          <p>Here are some helpful links:</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/courses"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Browse Courses
            </Link>
            <span>•</span>
            <Link
              to="/help"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Help Center
            </Link>
            <span>•</span>
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Search Box */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for courses, topics, or resources..."
              className="form-input pr-10 w-full"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-3 flex items-center"
            >
              <i className="fas fa-search text-gray-400"></i>
            </button>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-blue-600 mb-2">
              <i className="fas fa-book-open text-2xl"></i>
            </div>
            <h3 className="font-semibold mb-1">Learning Resources</h3>
            <p className="text-sm text-gray-600">
              Access our library of tutorials and guides
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-blue-600 mb-2">
              <i className="fas fa-question-circle text-2xl"></i>
            </div>
            <h3 className="font-semibold mb-1">FAQ</h3>
            <p className="text-sm text-gray-600">
              Find answers to common questions
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-blue-600 mb-2">
              <i className="fas fa-headset text-2xl"></i>
            </div>
            <h3 className="font-semibold mb-1">Support</h3>
            <p className="text-sm text-gray-600">
              Get help from our support team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

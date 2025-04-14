import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Learn Without Limits
              </h1>
              <p className="text-xl mb-8">
                Discover new skills, expand your knowledge, and advance your career with our expert-led courses.
              </p>
              <div className="space-x-4">
                {isAuthenticated ? (
                  <Link to="/courses" className="btn btn-primary btn-lg">
                    Browse Courses
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg">
                      Get Started
                    </Link>
                    <Link to="/courses" className="btn btn-outline-white btn-lg">
                      Browse Courses
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/images/hero-illustration.svg"
                alt="Learning illustration"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl text-blue-600 mb-4">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from industry experts who share their knowledge and real-world experience.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl text-blue-600 mb-4">
                <i className="fas fa-clock"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">Learn at Your Pace</h3>
              <p className="text-gray-600">
                Access course content anytime, anywhere, and learn at your own pace.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl text-blue-600 mb-4">
                <i className="fas fa-certificate"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Certified</h3>
              <p className="text-gray-600">
                Earn certificates upon completion and showcase your achievements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link
              to="/courses?category=programming"
              className="group bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-code"></i>
              </div>
              <h3 className="font-semibold">Programming</h3>
            </Link>
            <Link
              to="/courses?category=design"
              className="group bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-palette"></i>
              </div>
              <h3 className="font-semibold">Design</h3>
            </Link>
            <Link
              to="/courses?category=business"
              className="group bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="font-semibold">Business</h3>
            </Link>
            <Link
              to="/courses?category=marketing"
              className="group bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3 className="font-semibold">Marketing</h3>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of students who are already learning on our platform.
          </p>
          {isAuthenticated ? (
            <Link to="/courses" className="btn btn-primary btn-lg">
              Browse Courses
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary btn-lg">
              Sign Up Now
            </Link>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Students Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <img
                  src="https://via.placeholder.com/50"
                  alt="Student"
                  className="w-12 h-12 rounded-full mr-4"
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

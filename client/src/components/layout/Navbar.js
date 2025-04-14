import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            aria-label="Home"
          >
            <i className="fas fa-graduation-cap text-2xl text-blue-600"></i>
            <span className="text-xl font-bold">EduPlatform</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/courses"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Courses
            </Link>
            {user?.role === 'instructor' && (
              <Link
                to="/courses/create"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Create Course
              </Link>
            )}
            <Link
              to="/about"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <img
                    src={user.avatar || 'https://via.placeholder.com/40'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-gray-700">{user.name}</span>
                  <i className={`fas fa-chevron-${isProfileOpen ? 'up' : 'down'} text-gray-500`}></i>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <Link
                      to={`/dashboard/${user.role}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      <i className="fas fa-tachometer-alt mr-2"></i>
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      <i className="fas fa-user-cog mr-2"></i>
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 transition-colors px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-2 rounded-md"
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            <i className={`fas fa-${isMenuOpen ? 'times' : 'bars'} text-gray-600`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4" ref={menuRef}>
            <div className="space-y-2">
              <Link
                to="/courses"
                className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Courses
              </Link>
              {user?.role === 'instructor' && (
                <Link
                  to="/courses/create"
                  className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Create Course
                </Link>
              )}
              <Link
                to="/about"
                className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Contact
              </Link>

              {user ? (
                <>
                  <Link
                    to={`/dashboard/${user.role}`}
                    className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    <i className="fas fa-user-cog mr-2"></i>
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-2"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourse } from '../hooks/useCourse';
import { toast } from 'react-hot-toast';

const QUICK_LINKS = [
  {
    icon: 'book-open',
    title: 'Learning Resources',
    description: 'Access our library of tutorials and guides',
    link: '/resources',
    color: 'blue'
  },
  {
    icon: 'question-circle',
    title: 'FAQ',
    description: 'Find answers to common questions',
    link: '/faq',
    color: 'green'
  },
  {
    icon: 'headset',
    title: '24/7 Support',
    description: 'Get help from our support team',
    link: '/support',
    color: 'purple'
  }
];

const HELP_LINKS = [
  { to: '/courses', text: 'Browse Courses', icon: 'graduation-cap' },
  { to: '/help', text: 'Help Center', icon: 'life-ring' },
  { to: '/contact', text: 'Contact Support', icon: 'envelope' },
  { to: '/sitemap', text: 'Sitemap', icon: 'sitemap' }
];

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchCourses } = useCourse();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Log 404 errors for monitoring
  useEffect(() => {
    console.error('404 Error:', {
      path: location.pathname,
      timestamp: new Date().toISOString(),
      referrer: document.referrer
    });
  }, [location]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const results = await searchCourses({ query: searchQuery });
      setSearchResults(results.slice(0, 3)); // Show top 3 results
      setShowSuggestions(true);

      if (results.length === 0) {
        toast.error('No results found. Try different keywords.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="text-center max-w-4xl w-full">
        {/* 404 Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-20"></div>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <svg
              className="mx-auto h-48 w-48 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            404
          </h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600">
            Oops! The page you're looking for seems to have wandered off.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Go Back
          </motion.button>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="btn btn-primary">
              <i className="fas fa-home mr-2"></i>
              Return Home
            </Link>
          </motion.div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <h3 className="text-xl font-semibold mb-6">
            Looking for something specific?
          </h3>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, topics, or resources..."
              className="form-input pl-12 pr-12 py-4 w-full rounded-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
            />
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary rounded-full py-2"
              disabled={isSearching}
            >
              {isSearching ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                'Search'
              )}
            </motion.button>
          </form>

          {/* Search Results */}
          <AnimatePresence>
            {showSuggestions && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 bg-white rounded-2xl shadow-lg p-6"
              >
                <h4 className="font-semibold mb-4">Suggested Content:</h4>
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <motion.div
                      key={result.id}
                      whileHover={{ x: 10 }}
                      className="group"
                    >
                      <Link
                        to={`/courses/${result.id}`}
                        className="block p-4 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <div className="flex items-center">
                          <img
                            src={result.thumbnail || 'https://via.placeholder.com/40'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover mr-4"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {result.title}
                            </h5>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {result.description}
                            </p>
                          </div>
                          <i className="fas fa-arrow-right text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  <Link
                    to={`/courses?q=${encodeURIComponent(searchQuery)}`}
                    className="block text-center text-blue-600 hover:text-blue-800 font-medium pt-4 border-t"
                  >
                    View all results →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16"
        >
          {QUICK_LINKS.map((item, index) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -5 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.link}
                className="block p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`text-${item.color}-500 mb-4 group-hover:scale-110 transition-transform`}>
                  <i className={`fas fa-${item.icon} text-3xl`}></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Help Links */}
        <motion.nav
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border-t border-gray-200 pt-8"
        >
          <div className="text-sm text-gray-500">
            <p className="mb-6 text-base">Additional Resources:</p>
            <div className="flex flex-wrap justify-center gap-6">
              {HELP_LINKS.map((link) => (
                <motion.div
                  key={link.to}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.to}
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <i className={`fas fa-${link.icon} mr-2`}></i>
                    {link.text}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.nav>
      </div>
    </motion.main>
  );
};

export default NotFound;

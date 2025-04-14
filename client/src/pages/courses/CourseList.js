import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourse } from '../../hooks/useCourse';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../../components/courses/CourseCard';
import { PageLoader } from '../../components/common/LoadingSpinner';

const ITEMS_PER_PAGE = 12;

const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    courses,
    loading,
    loadCourses,
    filterCourses,
    courseStats,
    filters: globalFilters,
    updateFilters: updateGlobalFilters,
    clearFilters: clearGlobalFilters
  } = useCourse();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    price: searchParams.get('price') || '',
    search: searchParams.get('q') || '',
    sort: searchParams.get('sort') || 'newest',
    rating: searchParams.get('rating') || ''
  });

  // Available filter options
  const filterOptions = {
    categories: [
      { value: 'programming', label: 'Programming' },
      { value: 'design', label: 'Design' },
      { value: 'business', label: 'Business' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'photography', label: 'Photography' }
    ],
    levels: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' }
    ],
    prices: [
      { value: 'free', label: 'Free' },
      { value: 'paid', label: 'Paid' },
      { value: 'under-50', label: 'Under $50' },
      { value: '50-100', label: '$50 - $100' },
      { value: 'over-100', label: 'Over $100' }
    ],
    sortOptions: [
      { value: 'newest', label: 'Newest First' },
      { value: 'oldest', label: 'Oldest First' },
      { value: 'price-low', label: 'Price: Low to High' },
      { value: 'price-high', label: 'Price: High to Low' },
      { value: 'rating', label: 'Highest Rated' },
      { value: 'popular', label: 'Most Popular' }
    ]
  };

  // Load courses on mount and when filters change
  useEffect(() => {
    loadCourses();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, setSearchParams]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = filterCourses(courses, filters);

    // Apply sorting
    switch (filters.sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result.sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0));
        break;
      default:
        break;
    }

    return result;
  }, [courses, filters, filterCourses]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      level: '',
      price: '',
      search: '',
      sort: 'newest',
      rating: ''
    });
    clearGlobalFilters();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Courses</h1>
          <p className="text-gray-600">
            Discover our wide range of courses and start learning today
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Courses', value: courseStats.totalCourses },
            { label: 'Free Courses', value: courseStats.freeCourses },
            { label: 'Students Enrolled', value: '10,000+' },
            { label: 'Average Rating', value: courseStats.averageRating.toFixed(1) }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-4 text-center"
            >
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search" className="sr-only">Search courses</label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Search courses..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="form-input pl-10 w-full"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-auto">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="form-select"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="w-full md:w-auto">
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="form-select"
                aria-label="Filter by level"
              >
                <option value="">All Levels</option>
                {filterOptions.levels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="w-full md:w-auto">
              <select
                value={filters.price}
                onChange={(e) => handleFilterChange('price', e.target.value)}
                className="form-select"
                aria-label="Filter by price"
              >
                <option value="">All Prices</option>
                {filterOptions.prices.map(price => (
                  <option key={price.value} value={price.value}>
                    {price.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="w-full md:w-auto">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="form-select"
                aria-label="Sort courses"
              >
                {filterOptions.sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              const label = filterOptions[`${key}s`]?.find(opt => opt.value === value)?.label || value;
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {label}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-2 focus:outline-none"
                    aria-label={`Remove ${label} filter`}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              );
            })}
            {Object.values(filters).some(Boolean) && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Found {filteredCourses.length} courses
        </div>

        {/* Course Grid */}
        <AnimatePresence mode="wait">
          {paginatedCourses.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {paginatedCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No Courses Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearAllFilters}
                className="btn btn-primary"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-2" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-icon"
                aria-label="Previous page"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn ${
                      isCurrentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-current={isCurrentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-icon"
                aria-label="Next page"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;

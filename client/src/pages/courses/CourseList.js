import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourse';
import { ContentLoader } from '../../components/common/LoadingSpinner';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    priceRange: '',
    sortBy: 'newest'
  });
  const { fetchCourses, loading, error } = useCourse();

  // Categories and levels for filters
  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX',
    'Data Science',
    'Business',
    'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const priceRanges = [
    { label: 'All', value: '' },
    { label: 'Free', value: 'free' },
    { label: 'Under $50', value: '0-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: 'Over $100', value: '100+' }
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Highest Rated', value: 'rating' }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, courses]);

  const loadCourses = async () => {
    try {
      const response = await fetchCourses();
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }

    // Apply level filter
    if (filters.level) {
      filtered = filtered.filter(course => course.level === filters.level);
    }

    // Apply price range filter
    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'free':
          filtered = filtered.filter(course => course.price === 0);
          break;
        case '0-50':
          filtered = filtered.filter(course => course.price > 0 && course.price <= 50);
          break;
        case '50-100':
          filtered = filtered.filter(course => course.price > 50 && course.price <= 100);
          break;
        case '100+':
          filtered = filtered.filter(course => course.price > 100);
          break;
        default:
          break;
      }
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.totalEnrolled - a.totalEnrolled);
        break;
      case 'rating':
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  };

  if (loading) {
    return <ContentLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadCourses}
          className="mt-4 btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Available Courses
        </h1>
        <p className="text-gray-600">
          Explore our wide range of courses and start learning today
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="form-input"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="form-input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="form-input"
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="form-input"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="form-input"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course._id} className="course-card">
              <img
                src={course.thumbnail || 'https://via.placeholder.com/300x200'}
                alt={course.title}
                className="course-card-image"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge badge-${course.level.toLowerCase()}`}>
                    {course.level}
                  </span>
                  <span className="text-gray-600">
                    {course.duration} hours
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.shortDescription}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">
                      <i className="fas fa-star"></i>
                    </span>
                    <span className="font-medium">{course.averageRating.toFixed(1)}</span>
                    <span className="text-gray-600 ml-2">
                      ({course.numberOfReviews} reviews)
                    </span>
                  </div>
                  <span className="font-bold text-lg">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                </div>
                <Link
                  to={`/courses/${course._id}`}
                  className="btn-primary w-full text-center"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No courses found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default CourseList;

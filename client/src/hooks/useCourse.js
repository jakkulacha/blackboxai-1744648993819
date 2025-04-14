import { useContext, useMemo, useCallback } from 'react';
import { CourseContext } from '../context/CourseContext';
import { useAuth } from './useAuth';

/**
 * Custom hook for course management and utilities
 * @returns {Object} Course context values and utility functions
 */
export const useCourse = () => {
  const context = useContext(CourseContext);
  const { user } = useAuth();

  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }

  const {
    // State
    courses,
    featuredCourses,
    popularCourses,
    loading,
    error,
    filters,
    pagination,

    // Course operations
    loadCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    
    // Filter management
    updateFilters,
    clearFilters,
    
    // Enrollment
    enrollCourse,
    unenrollCourse,
    
    // Lesson management
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    
    // Progress tracking
    markLessonComplete,
    markLessonIncomplete,

    // Cache management
    clearCache
  } = context;

  /**
   * Format course duration from minutes to readable string
   * @param {number} minutes - Duration in minutes
   * @param {Object} options - Formatting options
   * @returns {string} Formatted duration
   */
  const formatDuration = useCallback((minutes, options = {}) => {
    const {
      short = false,
      includeSeconds = false
    } = options;

    if (!minutes) return short ? '0m' : '0 minutes';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const parts = [];

    if (hours > 0) {
      parts.push(short ? `${hours}h` : `${hours} hour${hours !== 1 ? 's' : ''}`);
    }
    
    if (remainingMinutes > 0 || (!hours && !includeSeconds)) {
      parts.push(short ? `${remainingMinutes}m` : `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`);
    }

    return parts.join(' ');
  }, []);

  /**
   * Calculate course completion percentage
   * @param {Object} course - Course object
   * @returns {number} Completion percentage
   */
  const calculateProgress = useCallback((course) => {
    if (!course?.lessons?.length) return 0;
    
    const totalLessons = course.lessons.length;
    const completedLessons = course.lessons.filter(lesson => lesson.completed).length;
    return Math.round((completedLessons / totalLessons) * 100);
  }, []);

  /**
   * Get course difficulty level label with optional styling
   * @param {string} level - Course difficulty level
   * @param {Object} options - Display options
   * @returns {Object} Level label and style information
   */
  const getDifficultyInfo = useCallback((level, options = {}) => {
    const { withColor = true } = options;
    
    const levels = {
      beginner: {
        label: 'Beginner',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: 'seedling'
      },
      intermediate: {
        label: 'Intermediate',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: 'tree'
      },
      advanced: {
        label: 'Advanced',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        icon: 'mountain'
      },
      expert: {
        label: 'Expert',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: 'crown'
      }
    };

    const defaultLevel = {
      label: level,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: 'circle'
    };

    return levels[level?.toLowerCase()] || defaultLevel;
  }, []);

  /**
   * Format course price with various options
   * @param {number} price - Course price
   * @param {Object} options - Formatting options
   * @returns {string} Formatted price
   */
  const formatPrice = useCallback((price, options = {}) => {
    const {
      currency = 'USD',
      locale = 'en-US',
      showFree = true,
      withCurrency = true
    } = options;

    if (price === 0) {
      return showFree ? 'Free' : '$0';
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }, []);

  /**
   * Sort lessons by various criteria
   * @param {Array} lessons - Array of lesson objects
   * @param {Object} options - Sorting options
   * @returns {Array} Sorted lessons
   */
  const sortLessons = useCallback((lessons, options = {}) => {
    const { by = 'order', direction = 'asc' } = options;
    
    return [...lessons].sort((a, b) => {
      let comparison = 0;
      
      switch (by) {
        case 'order':
          comparison = a.order - b.order;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = 0;
      }

      return direction === 'desc' ? -comparison : comparison;
    });
  }, []);

  /**
   * Get next lesson based on current lesson and completion status
   * @param {Object} course - Course object
   * @param {string} currentLessonId - Current lesson ID
   * @param {Object} options - Options for finding next lesson
   * @returns {Object|null} Next lesson or null
   */
  const getNextLesson = useCallback((course, currentLessonId, options = {}) => {
    const { skipLocked = false, onlyIncomplete = false } = options;
    
    if (!course?.lessons?.length) return null;
    
    const sortedLessons = sortLessons(course.lessons);
    const currentIndex = sortedLessons.findIndex(lesson => lesson._id === currentLessonId);
    
    if (currentIndex === -1) return sortedLessons[0];
    
    for (let i = currentIndex + 1; i < sortedLessons.length; i++) {
      const lesson = sortedLessons[i];
      if (skipLocked && lesson.locked) continue;
      if (onlyIncomplete && lesson.completed) continue;
      return lesson;
    }
    
    return null;
  }, [sortLessons]);

  /**
   * Get course status with detailed information
   * @param {Object} course - Course object
   * @returns {Object} Course status information
   */
  const getCourseStatus = useCallback((course) => {
    const progress = calculateProgress(course);
    const isEnrolled = course.enrolledStudents?.includes(user?._id);

    if (!course.published) {
      return {
        code: 'draft',
        label: 'Draft',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: 'edit'
      };
    }

    if (progress === 100) {
      return {
        code: 'completed',
        label: 'Completed',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: 'check-circle'
      };
    }

    if (progress > 0) {
      return {
        code: 'in-progress',
        label: 'In Progress',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: 'clock',
        progress
      };
    }

    if (isEnrolled) {
      return {
        code: 'not-started',
        label: 'Not Started',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: 'play-circle'
      };
    }

    return {
      code: 'not-enrolled',
      label: 'Not Enrolled',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: 'lock'
    };
  }, [calculateProgress, user]);

  /**
   * Filter and search courses with multiple criteria
   * @param {Array} courses - Array of course objects
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered courses
   */
  const filterCourses = useCallback((courses, filters = {}) => {
    return courses.filter(course => {
      // Category filter
      if (filters.category && course.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }

      // Level filter
      if (filters.level && course.level.toLowerCase() !== filters.level.toLowerCase()) {
        return false;
      }

      // Price filter
      if (filters.price === 'free' && course.price !== 0) return false;
      if (filters.price === 'paid' && course.price === 0) return false;

      // Rating filter
      if (filters.rating && course.rating < parseFloat(filters.rating)) {
        return false;
      }

      // Search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchFields = [
          course.title,
          course.description,
          course.instructor.name,
          course.category,
          ...(course.tags || [])
        ].map(field => field?.toLowerCase());

        return searchFields.some(field => field?.includes(searchTerm));
      }

      return true;
    });
  }, []);

  /**
   * Get course analytics and statistics
   * @param {Object} course - Course object
   * @returns {Object} Course analytics
   */
  const getCourseAnalytics = useCallback((course) => {
    return {
      totalStudents: course.enrolledStudents?.length || 0,
      totalLessons: course.lessons?.length || 0,
      totalDuration: course.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0,
      averageRating: course.rating || 0,
      totalReviews: course.reviews?.length || 0,
      completionRate: course.enrolledStudents?.length
        ? (course.completedStudents?.length / course.enrolledStudents.length) * 100
        : 0,
      revenue: course.price * (course.enrolledStudents?.length || 0)
    };
  }, []);

  // Memoized derived data
  const courseStats = useMemo(() => ({
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.published).length,
    freeCourses: courses.filter(c => c.price === 0).length,
    averageRating: courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length || 0
  }), [courses]);

  return {
    // Context values
    courses,
    featuredCourses,
    popularCourses,
    loading,
    error,
    filters,
    pagination,
    courseStats,

    // Course operations
    loadCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    
    // Filter management
    updateFilters,
    clearFilters,
    
    // Enrollment
    enrollCourse,
    unenrollCourse,
    
    // Lesson management
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    
    // Progress tracking
    markLessonComplete,
    markLessonIncomplete,

    // Cache management
    clearCache,

    // Utility functions
    formatDuration,
    calculateProgress,
    getDifficultyInfo,
    formatPrice,
    sortLessons,
    getNextLesson,
    getCourseStatus,
    filterCourses,
    getCourseAnalytics
  };
};

export default useCourse;

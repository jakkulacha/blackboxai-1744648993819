import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * @typedef {Object} User
 * @property {string} _id - User's unique identifier
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {string} role - User's role (student, instructor, admin)
 * @property {string} [avatar] - URL to user's avatar image
 * @property {boolean} [emailVerified] - Whether user's email is verified
 * @property {Object} [subscription] - User's subscription details
 * @property {Array} [enrolledCourses] - Courses user is enrolled in
 * @property {Array} [createdCourses] - Courses created by user
 * @property {Array} [permissions] - User's permissions
 * @property {boolean} [profileComplete] - Whether user has completed their profile
 */

/**
 * Custom hook to access authentication context and related utilities
 * @returns {Object} Authentication context values and utility methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    hasRole,
    hasPermission,
    hasAnyRole,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    setError
  } = context;

  // Role checks with memoization
  const isInstructor = useCallback(() => hasRole('instructor'), [hasRole]);
  const isStudent = useCallback(() => hasRole('student'), [hasRole]);
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);

  /**
   * Get user's display name with fallback options
   * @param {Object} options - Options for display name
   * @param {boolean} [options.useEmail=false] - Whether to use email as fallback
   * @param {string} [options.fallback='User'] - Default fallback text
   * @returns {string} User's display name
   */
  const getUserDisplayName = useCallback((options = {}) => {
    const { useEmail = false, fallback = 'User' } = options;
    if (!user) return fallback;
    return user.name || (useEmail ? user.email : user.email.split('@')[0]) || fallback;
  }, [user]);

  /**
   * Get user's avatar URL with fallback
   * @param {Object} options - Options for avatar URL
   * @param {string} [options.fallback='/default-avatar.jpg'] - Default avatar URL
   * @param {string} [options.size='medium'] - Avatar size (small, medium, large)
   * @returns {string} Avatar URL
   */
  const getUserAvatar = useCallback((options = {}) => {
    const { fallback = '/default-avatar.jpg', size = 'medium' } = options;
    if (!user?.avatar) return fallback;
    
    // If avatar is from a service that supports size parameters (like Gravatar)
    if (user.avatar.includes('gravatar.com')) {
      const sizes = { small: 80, medium: 160, large: 320 };
      return `${user.avatar}&s=${sizes[size]}`;
    }
    
    return user.avatar;
  }, [user]);

  /**
   * Check if user has completed their profile
   * @returns {Object} Profile completion status and missing fields
   */
  const getProfileCompletion = useCallback(() => {
    if (!user) return { complete: false, missingFields: [] };

    const requiredFields = ['name', 'email', 'avatar', 'bio'];
    const missingFields = requiredFields.filter(field => !user[field]);

    return {
      complete: missingFields.length === 0,
      missingFields,
      percentage: Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
    };
  }, [user]);

  /**
   * Get user's course enrollments with detailed information
   * @param {Object} options - Filter options
   * @returns {Array} Filtered course enrollments
   */
  const getEnrollments = useCallback((options = {}) => {
    const { status, sortBy = 'enrolledAt', limit } = options;
    if (!user?.enrolledCourses) return [];

    let filtered = [...user.enrolledCourses];

    if (status) {
      filtered = filtered.filter(enrollment => enrollment.status === status);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'enrolledAt') return new Date(b.enrolledAt) - new Date(a.enrolledAt);
      return 0;
    });

    return limit ? filtered.slice(0, limit) : filtered;
  }, [user]);

  /**
   * Get user's course teaching statistics
   * @returns {Object} Teaching statistics
   */
  const getTeachingStats = useCallback(() => {
    if (!user?.createdCourses) return {
      totalCourses: 0,
      totalStudents: 0,
      averageRating: 0,
      totalRevenue: 0
    };

    return user.createdCourses.reduce((stats, course) => ({
      totalCourses: stats.totalCourses + 1,
      totalStudents: stats.totalStudents + (course.enrolledStudents?.length || 0),
      averageRating: (stats.averageRating + (course.rating || 0)) / 2,
      totalRevenue: stats.totalRevenue + (course.revenue || 0)
    }), {
      totalCourses: 0,
      totalStudents: 0,
      averageRating: 0,
      totalRevenue: 0
    });
  }, [user]);

  /**
   * Check if user has specific permissions for a course
   * @param {string} courseId - Course ID
   * @param {string|Array} permission - Required permission(s)
   * @returns {boolean} Whether user has permission
   */
  const hasCoursePermission = useCallback((courseId, permission) => {
    if (!user) return false;
    
    // Admins have all permissions
    if (isAdmin()) return true;

    // Instructors have all permissions for their own courses
    if (isInstructor() && user.createdCourses?.includes(courseId)) return true;

    // Check specific permissions for enrolled students
    if (isStudent()) {
      const enrollment = user.enrolledCourses?.find(e => e.course === courseId);
      if (!enrollment) return false;

      const permissions = Array.isArray(permission) ? permission : [permission];
      return permissions.every(p => enrollment.permissions?.includes(p));
    }

    return false;
  }, [user, isAdmin, isInstructor, isStudent]);

  /**
   * Get user's notification preferences
   * @returns {Object} Notification preferences
   */
  const getNotificationPreferences = useCallback(() => {
    return user?.notificationPreferences || {
      email: true,
      push: true,
      courseUpdates: true,
      newMessages: true,
      marketingEmails: false
    };
  }, [user]);

  return {
    // Context values
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    
    // Auth methods
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    setError,
    
    // Role and permission checks
    isInstructor,
    isStudent,
    isAdmin,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasCoursePermission,
    
    // User info helpers
    getUserDisplayName,
    getUserAvatar,
    getProfileCompletion,
    getNotificationPreferences,
    
    // Course-related helpers
    getEnrollments,
    getTeachingStats
  };
};

export default useAuth;

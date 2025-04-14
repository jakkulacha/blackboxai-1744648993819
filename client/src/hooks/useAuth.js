import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context values and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    loading,
    isAuthenticated,
    hasRole,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail
  } = context;

  // Helper functions
  const isInstructor = () => hasRole('instructor');
  const isStudent = () => hasRole('student');
  const isAdmin = () => hasRole('admin');

  // Get user's full name or username
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.email.split('@')[0];
  };

  // Get user's avatar or default avatar
  const getUserAvatar = () => {
    if (!user) return '/default-avatar.jpg';
    return user.avatar || '/default-avatar.jpg';
  };

  // Check if user has completed their profile
  const hasCompletedProfile = () => {
    if (!user) return false;
    return user.profileComplete || false;
  };

  // Get user's enrolled courses (for students)
  const getEnrolledCourses = () => {
    if (!user || !isStudent()) return [];
    return user.enrolledCourses || [];
  };

  // Get user's created courses (for instructors)
  const getCreatedCourses = () => {
    if (!user || !isInstructor()) return [];
    return user.createdCourses || [];
  };

  // Check if user is enrolled in a specific course
  const isEnrolledInCourse = (courseId) => {
    if (!user || !isStudent()) return false;
    return user.enrolledCourses?.some(
      enrollment => enrollment.course.toString() === courseId.toString()
    );
  };

  // Check if user is the instructor of a specific course
  const isInstructorOfCourse = (courseId) => {
    if (!user || !isInstructor()) return false;
    return user.createdCourses?.some(
      course => course.toString() === courseId.toString()
    );
  };

  // Get user's progress in a specific course
  const getCourseProgress = (courseId) => {
    if (!user || !isStudent()) return 0;
    const enrollment = user.enrolledCourses?.find(
      e => e.course.toString() === courseId.toString()
    );
    return enrollment?.progress || 0;
  };

  // Get user's completed lessons in a course
  const getCompletedLessons = (courseId) => {
    if (!user || !isStudent()) return [];
    const enrollment = user.enrolledCourses?.find(
      e => e.course.toString() === courseId.toString()
    );
    return enrollment?.completedLessons || [];
  };

  // Check if a specific lesson is completed
  const isLessonCompleted = (courseId, lessonId) => {
    if (!user || !isStudent()) return false;
    const completedLessons = getCompletedLessons(courseId);
    return completedLessons.includes(lessonId);
  };

  return {
    // Context values
    user,
    loading,
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
    
    // Role checks
    isInstructor,
    isStudent,
    isAdmin,
    
    // User info helpers
    getUserDisplayName,
    getUserAvatar,
    hasCompletedProfile,
    
    // Course-related helpers
    getEnrolledCourses,
    getCreatedCourses,
    isEnrolledInCourse,
    isInstructorOfCourse,
    getCourseProgress,
    getCompletedLessons,
    isLessonCompleted
  };
};

export default useAuth;

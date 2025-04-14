import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCourse } from '../../hooks/useCourse';
import { toast } from 'react-hot-toast';

const CourseCard = ({ course }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    formatDuration,
    formatPrice,
    getDifficultyInfo,
    calculateProgress,
    enrollCourse,
    getCourseStatus
  } = useCourse();

  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isEnrolled = user?.enrolledCourses?.includes(course._id);
  const isInstructor = course.instructor._id === user?._id;
  const progress = isEnrolled ? calculateProgress(course) : 0;
  const difficultyInfo = getDifficultyInfo(course.level);
  const courseStatus = getCourseStatus(course);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return toast.error('Please sign in to enroll in this course');
    }

    try {
      setIsLoading(true);
      await enrollCourse(course._id);
      toast.success('Successfully enrolled in course!');
    } catch (error) {
      toast.error('Failed to enroll in course');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="group relative bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Course Status Badge */}
      {courseStatus.code !== 'not-enrolled' && (
        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-sm font-medium ${courseStatus.bgColor} ${courseStatus.color}`}>
          <i className={`fas fa-${courseStatus.icon} mr-2`}></i>
          {courseStatus.label}
        </div>
      )}

      {/* Course Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail || 'https://via.placeholder.com/400x225?text=Course+Thumbnail'}
          alt={`${course.title} course thumbnail`}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        {course.price === 0 && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Free
          </div>
        )}
        
        {/* Preview Overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            className="btn btn-white"
            onClick={() => window.open(course.previewUrl, '_blank')}
            aria-label="Watch course preview"
          >
            <i className="fas fa-play mr-2"></i>
            Preview
          </button>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Category & Level */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {course.category}
          </span>
          <span 
            className={`text-sm font-medium ${difficultyInfo.color} ${difficultyInfo.bgColor} px-3 py-1 rounded-full flex items-center`}
            title={`${difficultyInfo.label} Level`}
          >
            <i className={`fas fa-${difficultyInfo.icon} mr-1`}></i>
            {difficultyInfo.label}
          </span>
        </div>

        {/* Title */}
        <Link
          to={`/courses/${course._id}`}
          className="block group-hover:text-blue-600 transition-colors"
        >
          <h3 className="text-xl font-semibold mb-2 line-clamp-2" title={course.title}>
            {course.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2" title={course.description}>
          {course.shortDescription || course.description}
        </p>

        {/* Instructor */}
        <Link
          to={`/instructors/${course.instructor._id}`}
          className="flex items-center mb-4 group/instructor"
        >
          <img
            src={course.instructor.avatar || 'https://via.placeholder.com/40?text=Instructor'}
            alt={`${course.instructor.name}'s profile picture`}
            className="w-10 h-10 rounded-full object-cover mr-3"
            loading="lazy"
          />
          <div>
            <h4 className="text-sm font-medium group-hover/instructor:text-blue-600 transition-colors">
              {course.instructor.name}
            </h4>
            <p className="text-xs text-gray-500">{course.instructor.title || 'Instructor'}</p>
          </div>
        </Link>

        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center" title="Total enrolled students">
            <i className="fas fa-users mr-2 text-blue-500"></i>
            <span>{course.enrolledStudents?.length || 0} students</span>
          </div>
          <div className="flex items-center" title="Course duration">
            <i className="fas fa-clock mr-2 text-green-500"></i>
            <span>{formatDuration(course.duration)}</span>
          </div>
          <div className="flex items-center" title="Course rating">
            <i className="fas fa-star mr-2 text-yellow-400"></i>
            <span>{course.rating?.toFixed(1) || 'N/A'}</span>
            {course.totalReviews > 0 && (
              <span className="ml-1 text-xs">({course.totalReviews})</span>
            )}
          </div>
        </div>

        {/* Course Features */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          {course.features?.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center">
              <i className="fas fa-check text-green-500 mr-2"></i>
              {feature}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {isEnrolled && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Your Progress</span>
              <span className="text-sm font-medium text-blue-600">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(course.price)}
            </span>
            {course.originalPrice > course.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(course.originalPrice)}
              </span>
            )}
          </div>

          {isInstructor ? (
            <Link
              to={`/courses/${course._id}/edit`}
              className="btn btn-secondary"
              aria-label="Edit course"
            >
              <i className="fas fa-edit mr-2"></i>
              Edit Course
            </Link>
          ) : isEnrolled ? (
            <Link
              to={`/courses/${course._id}/learn`}
              className="btn btn-primary"
              aria-label={progress === 100 ? 'Review completed course' : 'Continue learning'}
            >
              <i className={`fas fa-${progress === 100 ? 'redo' : 'play'} mr-2`}></i>
              {progress === 100 ? 'Review Course' : 'Continue Learning'}
            </Link>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={isLoading}
              className="btn btn-primary"
              aria-label="Enroll in course"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Enrolling...
                </>
              ) : (
                <>
                  <i className="fas fa-graduation-cap mr-2"></i>
                  Enroll Now
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    shortDescription: PropTypes.string,
    thumbnail: PropTypes.string,
    previewUrl: PropTypes.string,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    duration: PropTypes.number.isRequired,
    level: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    rating: PropTypes.number,
    totalReviews: PropTypes.number,
    enrolledStudents: PropTypes.arrayOf(PropTypes.string),
    features: PropTypes.arrayOf(PropTypes.string),
    published: PropTypes.bool,
    instructor: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      title: PropTypes.string
    }).isRequired
  }).isRequired
};

export default CourseCard;

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CourseCard Component
 * Displays individual course information
 * 
 * @param {Object} props
 * @param {Object} props.course - Course data
 * @returns {React.ReactNode}
 */
const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <img
        src={course.thumbnail || 'https://via.placeholder.com/300x200'}
        alt={course.title}
        className="course-card-image"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.shortDescription}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">
              <i className="fas fa-star"></i>
            </span>
            <span className="font-medium">{course.averageRating.toFixed(1)}</span>
            <span className="text-gray-600 ml-2">({course.numberOfReviews} reviews)</span>
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
  );
};

export default CourseCard;

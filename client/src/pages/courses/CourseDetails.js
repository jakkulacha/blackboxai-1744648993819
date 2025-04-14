import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourse';
import { useAuth } from '../../hooks/useAuth';
import { ContentLoader, ButtonLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCourse, enrollInCourse } = useCourse();
  const { isAuthenticated, user, isStudent } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await fetchCourse(id);
      setCourse(response.data);
    } catch (error) {
      toast.error('Failed to load course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(id);
      toast.success('Successfully enrolled in course!');
      navigate(`/courses/${id}/lessons`);
    } catch (error) {
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <ContentLoader />;
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Course not found</p>
      </div>
    );
  }

  const isEnrolled = user?.enrolledCourses?.some(
    enrollment => enrollment.course === id
  );

  const isInstructor = user?.id === course.instructor._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative">
          <img
            src={course.thumbnail || 'https://via.placeholder.com/1200x400'}
            alt={course.title}
            className="w-full h-64 object-cover"
          />
          {course.previewVideo && (
            <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
              <i className="fas fa-play-circle text-6xl"></i>
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                {course.shortDescription}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </div>
              {!isInstructor && !isEnrolled && (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-primary w-48"
                >
                  {enrolling ? <ButtonLoader color="white" /> : 'Enroll Now'}
                </button>
              )}
              {isEnrolled && (
                <button
                  onClick={() => navigate(`/courses/${id}/lessons`)}
                  className="btn-secondary w-48"
                >
                  Continue Learning
                </button>
              )}
              {isInstructor && (
                <button
                  onClick={() => navigate(`/courses/edit/${id}`)}
                  className="btn-secondary w-48"
                >
                  Edit Course
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center text-gray-600">
              <i className="fas fa-user-tie mr-2"></i>
              <span>Instructor: {course.instructor.name}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <i className="fas fa-signal mr-2"></i>
              <span>Level: {course.level}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <i className="fas fa-clock mr-2"></i>
              <span>{course.duration} hours</span>
            </div>
            <div className="flex items-center text-gray-600">
              <i className="fas fa-users mr-2"></i>
              <span>{course.totalEnrolled} students</span>
            </div>
            <div className="flex items-center text-gray-600">
              <i className="fas fa-star text-yellow-400 mr-2"></i>
              <span>{course.averageRating.toFixed(1)} ({course.numberOfReviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Tabs */}
      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <div dangerouslySetInnerHTML={{ __html: course.description }} />
              
              <h3 className="text-xl font-bold mt-8 mb-4">What You'll Learn</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-bold mt-8 mb-4">Requirements</h3>
              <ul className="list-disc pl-5">
                {course.requirements.map((req, index) => (
                  <li key={index} className="mb-2">{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Curriculum Tab */}
          {activeTab === 'curriculum' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>
              <div className="space-y-4">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="bg-white rounded-lg shadow-sm p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-4">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="font-medium">{lesson.title}</h3>
                          <p className="text-sm text-gray-500">
                            {lesson.duration} minutes
                          </p>
                        </div>
                      </div>
                      {lesson.isPreview && (
                        <span className="badge badge-success">Preview</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructor Tab */}
          {activeTab === 'instructor' && (
            <div>
              <div className="flex items-center mb-6">
                <img
                  src={course.instructor.avatar || 'https://via.placeholder.com/100'}
                  alt={course.instructor.name}
                  className="w-24 h-24 rounded-full object-cover mr-6"
                />
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {course.instructor.name}
                  </h2>
                  <p className="text-gray-600">{course.instructor.bio}</p>
                </div>
              </div>
              {course.instructor.expertise && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.instructor.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="badge badge-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
              {course.ratings.length > 0 ? (
                <div className="space-y-6">
                  {course.ratings.map((rating) => (
                    <div
                      key={rating._id}
                      className="bg-white rounded-lg shadow-sm p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <img
                            src={rating.reviewer.avatar || 'https://via.placeholder.com/40'}
                            alt={rating.reviewer.name}
                            className="w-10 h-10 rounded-full mr-4"
                          />
                          <div>
                            <h4 className="font-medium">
                              {rating.reviewer.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star ${
                                i < rating.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{rating.review}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;

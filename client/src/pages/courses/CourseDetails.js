import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCourse } from '../../hooks/useCourse';
import { PageLoader } from '../../components/common/LoadingSpinner';
import ReactPlayer from 'react-player';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    getCourse,
    enrollCourse,
    formatDuration,
    formatPrice,
    getDifficultyInfo,
    calculateProgress,
    getCourseStatus
  } = useCourse();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [showPreview, setShowPreview] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState([]);

  const overviewRef = useRef(null);
  const contentRef = useRef(null);
  const requirementsRef = useRef(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const courseData = await getCourse(id);
      setCourse(courseData);
    } catch (error) {
      toast.error('Failed to load course');
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
      await enrollCourse(id);
      toast.success('Successfully enrolled in course');
      loadCourse();
    } catch (error) {
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const scrollToSection = (sectionRef) => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleLessonExpand = (lessonId) => {
    setExpandedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = course.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${title}&body=Check out this course: ${url}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        } catch (error) {
          toast.error('Failed to copy link');
        }
        break;
    }
  };

  if (loading) return <PageLoader />;
  if (!course) return null;

  const isEnrolled = course.enrolledStudents?.includes(user?._id);
  const isInstructor = course.instructor._id === user?._id;
  const progress = isEnrolled ? calculateProgress(course) : 0;
  const difficultyInfo = getDifficultyInfo(course.level);
  const courseStatus = getCourseStatus(course);

  const totalDuration = course.lessons?.reduce((sum, lesson) => sum + lesson.duration, 0) || 0;
  const completedLessons = course.lessons?.filter(lesson => lesson.completed)?.length || 0;
  const totalLessons = course.lessons?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Course Info */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyInfo.bgColor} ${difficultyInfo.color}`}>
                    <i className={`fas fa-${difficultyInfo.icon} mr-2`}></i>
                    {difficultyInfo.label}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500">
                    {course.category}
                  </span>
                </div>

                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-lg text-blue-100 mb-6">{course.shortDescription}</p>

                <div className="flex items-center space-x-6 text-blue-100">
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-400 mr-2"></i>
                    <span className="font-medium text-white">{course.rating?.toFixed(1) || 'N/A'}</span>
                    <span className="ml-1">({course.ratings?.length || 0} ratings)</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-users mr-2"></i>
                    {course.enrolledStudents?.length || 0} students
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-clock mr-2"></i>
                    {formatDuration(totalDuration)}
                  </div>
                </div>

                <div className="flex items-center mt-6">
                  <img
                    src={course.instructor.avatar || 'https://via.placeholder.com/40'}
                    alt={course.instructor.name}
                    className="w-12 h-12 rounded-full border-2 border-white mr-4"
                  />
                  <div>
                    <p className="font-medium">{course.instructor.name}</p>
                    <p className="text-sm text-blue-100">
                      {course.instructor.title || 'Course Instructor'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Course Preview */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-xl overflow-hidden"
              >
                {showPreview && course.previewVideo ? (
                  <div className="aspect-video">
                    <ReactPlayer
                      url={course.previewVideo}
                      width="100%"
                      height="100%"
                      controls
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {course.previewVideo && (
                      <button
                        onClick={() => setShowPreview(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-60 transition-opacity"
                      >
                        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white bg-opacity-90">
                          <i className="fas fa-play text-3xl text-blue-600"></i>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatPrice(course.price)}
                      </div>
                      {course.originalPrice > course.price && (
                        <div className="text-lg text-gray-500 line-through">
                          {formatPrice(course.originalPrice)}
                        </div>
                      )}
                    </div>
                    {courseStatus.code !== 'not-enrolled' && (
                      <div className={`px-4 py-2 rounded-full ${courseStatus.bgColor} ${courseStatus.color}`}>
                        <i className={`fas fa-${courseStatus.icon} mr-2`}></i>
                        {courseStatus.label}
                      </div>
                    )}
                  </div>

                  {isInstructor ? (
                    <Link
                      to={`/courses/${id}/edit`}
                      className="btn btn-primary w-full mb-4"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit Course
                    </Link>
                  ) : isEnrolled ? (
                    <Link
                      to={`/courses/${id}/learn`}
                      className="btn btn-primary w-full mb-4"
                    >
                      <i className={`fas fa-${progress === 100 ? 'redo' : 'play'} mr-2`}></i>
                      {progress === 100 ? 'Review Course' : 'Continue Learning'}
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="btn btn-primary w-full mb-4"
                    >
                      {enrolling ? (
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

                  {isEnrolled && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Your progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-green-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {completedLessons} of {totalLessons} lessons completed
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center">
                      <i className="fas fa-infinity text-blue-500 w-6"></i>
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-mobile-alt text-blue-500 w-6"></i>
                      <span>Access on mobile and desktop</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-certificate text-blue-500 w-6"></i>
                      <span>Certificate of completion</span>
                    </div>
                    {course.features?.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <i className="fas fa-check text-blue-500 w-6"></i>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', ref: overviewRef },
              { id: 'content', label: 'Course Content', ref: contentRef },
              { id: 'requirements', label: 'Requirements', ref: requirementsRef },
              { id: 'reviews', label: 'Reviews', ref: reviewsRef }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  scrollToSection(tab.ref);
                }}
                className={`py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section ref={overviewRef} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">What You'll Learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {course.learningObjectives?.map((objective, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span>{objective}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Course Content */}
            <section ref={contentRef} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Course Content</h2>
              <div className="mb-4">
                <div className="text-sm text-gray-500">
                  {totalLessons} lessons • {formatDuration(totalDuration)}
                </div>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {course.lessons?.map((lesson, index) => (
                    <motion.div
                      key={lesson._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleLessonExpand(lesson._id)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-500">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h3 className="font-medium">{lesson.title}</h3>
                              <p className="text-sm text-gray-500">
                                {formatDuration(lesson.duration)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {isEnrolled ? (
                              lesson.completed ? (
                                <i className="fas fa-check-circle text-green-500"></i>
                              ) : (
                                <i className="far fa-circle text-gray-300"></i>
                              )
                            ) : (
                              <i className="fas fa-lock text-gray-400"></i>
                            )}
                            <i className={`fas fa-chevron-${expandedLessons.includes(lesson._id) ? 'up' : 'down'} text-gray-400`}></i>
                          </div>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {expandedLessons.includes(lesson._id) && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="border-t px-4 py-3 bg-gray-50"
                          >
                            <p className="text-gray-600">{lesson.description}</p>
                            {lesson.preview && !isEnrolled && (
                              <button
                                onClick={() => {/* Handle preview */}}
                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                <i className="fas fa-play-circle mr-2"></i>
                                Preview this lesson
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* Requirements */}
            <section ref={requirementsRef} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Requirements</h2>
              <ul className="space-y-4">
                {course.requirements?.map((requirement, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <i className="fas fa-circle text-xs text-blue-500 mt-2 mr-3"></i>
                    <span>{requirement}</span>
                  </motion.li>
                ))}
              </ul>
            </section>

            {/* Reviews */}
            <section ref={reviewsRef} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Student Reviews</h2>
              {/* Add reviews component here */}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Course */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Share This Course</h3>
              <div className="grid grid-cols-4 gap-4">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center text-blue-600 hover:text-blue-800"
                >
                  <i className="fab fa-facebook-f text-xl mb-1"></i>
                  <span className="text-xs">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center text-blue-400 hover:text-blue-600"
                >
                  <i className="fab fa-twitter text-xl mb-1"></i>
                  <span className="text-xs">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex flex-col items-center text-blue-700 hover:text-blue-900"
                >
                  <i className="fab fa-linkedin-in text-xl mb-1"></i>
                  <span className="text-xs">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex flex-col items-center text-gray-600 hover:text-gray-800"
                >
                  <i className="fas fa-link text-xl mb-1"></i>
                  <span className="text-xs">Copy Link</span>
                </button>
              </div>
            </div>

            {/* Course Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Course Tags</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;

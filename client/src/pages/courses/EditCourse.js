import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCourse } from '../../hooks/useCourse';
import CourseForm from '../../components/courses/CourseForm';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getCourse,
    updateCourse,
    deleteCourse,
    formatDuration,
    formatPrice,
    getCourseAnalytics
  } = useCourse();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const courseData = await getCourse(id);
      
      // Check authorization
      if (courseData.instructor._id !== user?._id && user?.role !== 'admin') {
        toast.error('You are not authorized to edit this course');
        navigate('/courses');
        return;
      }

      setCourse(courseData);
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      setPublishing(true);
      await updateCourse(id, { ...course, published: !course.published });
      setCourse(prev => ({ ...prev, published: !prev.published }));
      toast.success(course.published ? 'Course unpublished' : 'Course published');
    } catch (error) {
      toast.error(`Failed to ${course.published ? 'unpublish' : 'publish'} course`);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteCourse(id);
      toast.success('Course deleted successfully');
      navigate('/dashboard/instructor');
    } catch (error) {
      toast.error('Failed to delete course');
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!course) return null;

  const analytics = getCourseAnalytics(course);

  const tabs = [
    { id: 'details', label: 'Course Details', icon: 'info-circle' },
    { id: 'content', label: 'Content', icon: 'book' },
    { id: 'pricing', label: 'Pricing', icon: 'dollar-sign' },
    { id: 'students', label: 'Students', icon: 'users' },
    { id: 'settings', label: 'Settings', icon: 'cog' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(course.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to={`/courses/${id}`}
                className="btn btn-secondary"
              >
                <i className="fas fa-eye mr-2"></i>
                Preview
              </Link>
              <button
                onClick={handlePublishToggle}
                disabled={publishing}
                className={`btn ${course.published ? 'btn-warning' : 'btn-success'}`}
              >
                {publishing ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className={`fas fa-${course.published ? 'times' : 'check'} mr-2`}></i>
                )}
                {course.published ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-blue-50 rounded-lg p-4"
            >
              <div className="text-blue-600">
                <i className="fas fa-users text-2xl"></i>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{analytics.totalStudents}</div>
                <div className="text-sm text-gray-600">Enrolled Students</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-green-50 rounded-lg p-4"
            >
              <div className="text-green-600">
                <i className="fas fa-dollar-sign text-2xl"></i>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{formatPrice(analytics.revenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-yellow-50 rounded-lg p-4"
            >
              <div className="text-yellow-600">
                <i className="fas fa-star text-2xl"></i>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Average Rating ({analytics.totalReviews})</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-purple-50 rounded-lg p-4"
            >
              <div className="text-purple-600">
                <i className="fas fa-graduation-cap text-2xl"></i>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 overflow-x-auto border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <i className={`fas fa-${tab.icon}`}></i>
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm"
            >
              {activeTab === 'details' && (
                <div className="p-6">
                  <CourseForm
                    initialData={course}
                    mode="edit"
                    onDirty={() => setIsDirty(true)}
                    onClean={() => setIsDirty(false)}
                  />
                </div>
              )}

              {/* Add other tab content here */}
            </motion.div>
          </AnimatePresence>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white rounded-lg shadow-sm p-6 border-t-4 border-red-500"
          >
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Danger Zone
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Delete Course</h3>
                <p className="text-gray-600">
                  Once you delete a course, there is no going back. Please be certain.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-danger"
              >
                Delete Course
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold mb-4">Delete Course</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{course.title}"? This action cannot be undone.
                {course.enrolledStudents?.length > 0 && (
                  <span className="block mt-2 text-red-600">
                    Warning: This course has {course.enrolledStudents.length} enrolled students.
                  </span>
                )}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn btn-danger"
                >
                  {deleting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Deleting...
                    </>
                  ) : (
                    'Delete Course'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditCourse;

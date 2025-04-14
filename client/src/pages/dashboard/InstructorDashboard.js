import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourse } from '../../hooks/useCourse';
import { useAuth } from '../../hooks/useAuth';
import DashboardCharts from '../../components/analytics/DashboardCharts';
import { PageLoader } from '../../components/common/LoadingSpinner';

const STATS_CARDS = [
  { id: 'students', label: 'Total Students', icon: 'users', color: 'blue', description: 'Across all courses' },
  { id: 'revenue', label: 'Total Revenue', icon: 'dollar-sign', color: 'green', description: 'Lifetime earnings' },
  { id: 'courses', label: 'Total Courses', icon: 'book', color: 'purple', description: 'Published courses' },
  { id: 'rating', label: 'Average Rating', icon: 'star', color: 'yellow', description: 'From student reviews' }
];

const QUICK_ACTIONS = [
  { label: 'Create New Course', icon: 'plus-circle', link: '/courses/create' },
  { label: 'Edit Profile', icon: 'user-edit', link: '/profile' },
  { label: 'View Analytics', icon: 'chart-line', link: '#analytics' },
  { label: 'Get Support', icon: 'question-circle', link: '/support' }
];

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { getMyCourses, deleteCourse, formatPrice } = useCourse();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [sortBy, setSortBy] = useState('students');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    totalCourses: 0,
    averageRating: 0,
    recentEnrollments: 0,
    revenueGrowth: 0,
    completionRate: 0,
    activeStudents: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const coursesData = await getMyCourses();
      setCourses(coursesData);

      // Calculate dashboard stats
      const totalStudents = coursesData.reduce(
        (sum, course) => sum + (course.enrolledStudents?.length || 0),
        0
      );

      const totalRevenue = coursesData.reduce(
        (sum, course) =>
          sum + course.price * (course.enrolledStudents?.length || 0),
        0
      );

      const totalRatings = coursesData.reduce(
        (sum, course) => sum + (course.ratings?.length || 0),
        0
      );

      const sumRatings = coursesData.reduce(
        (sum, course) => sum + (course.rating || 0),
        0
      );

      // Calculate completion rate
      const completedLessons = coursesData.reduce(
        (sum, course) => sum + (course.completedLessons || 0),
        0
      );
      const totalLessons = coursesData.reduce(
        (sum, course) => sum + (course.lessons?.length || 0),
        0
      );
      const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      setStats({
        totalStudents,
        totalRevenue,
        totalCourses: coursesData.length,
        averageRating: totalRatings > 0 ? (sumRatings / coursesData.length).toFixed(1) : 0,
        recentEnrollments: 0, // Calculate from recent data
        revenueGrowth: 0, // Calculate from historical data
        completionRate: completionRate.toFixed(1),
        activeStudents: totalStudents // Calculate active students
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      setDeleting(true);
      await deleteCourse(courseToDelete._id);
      setCourses(prev => prev.filter(course => course._id !== courseToDelete._id));
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete course');
    } finally {
      setDeleting(false);
      setCourseToDelete(null);
    }
  };

  const filteredCourses = courses
    .filter(course => {
      if (filterStatus === 'published') return course.published;
      if (filterStatus === 'draft') return !course.published;
      return true;
    })
    .filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'students':
          return (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0);
        case 'revenue':
          return (b.price * (b.enrolledStudents?.length || 0)) - (a.price * (a.enrolledStudents?.length || 0));
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your courses today
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {STATS_CARDS.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500">{card.label}</h3>
                <div className={`text-${card.color}-500 bg-${card.color}-50 p-3 rounded-full`}>
                  <i className={`fas fa-${card.icon} text-xl`}></i>
                </div>
              </div>
              <p className="text-3xl font-bold">
                {card.id === 'revenue' ? formatPrice(stats.totalRevenue) :
                 card.id === 'students' ? stats.totalStudents :
                 card.id === 'courses' ? stats.totalCourses :
                 stats.averageRating}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <span className="text-gray-500">{card.description}</span>
                {card.id === 'students' && stats.recentEnrollments > 0 && (
                  <span className="text-green-500 ml-2">
                    <i className="fas fa-arrow-up mr-1"></i>
                    {stats.recentEnrollments} new
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Analytics Charts */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Analytics Overview</h2>
            <div className="flex space-x-4">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    selectedTimeRange === range
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <DashboardCharts timeRange={selectedTimeRange} />
        </div>

        {/* Course Management */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Courses</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courses..."
                  className="form-input pl-10"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
              >
                <option value="students">Sort by Students</option>
                <option value="revenue">Sort by Revenue</option>
                <option value="rating">Sort by Rating</option>
              </select>
              <Link to="/courses/create" className="btn btn-primary">
                <i className="fas fa-plus mr-2"></i>
                Create New Course
              </Link>
            </div>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <motion.tr
                      key={course._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={course.thumbnail || 'https://via.placeholder.com/40'}
                            alt={course.title}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {course.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium">{course.enrolledStudents?.length || 0}</span>
                          {course.recentEnrollments > 0 && (
                            <span className="text-green-500 text-sm ml-2">
                              +{course.recentEnrollments}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPrice(course.price * (course.enrolledStudents?.length || 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">
                            <i className="fas fa-star"></i>
                          </span>
                          {course.rating?.toFixed(1) || 'N/A'}
                          {course.ratings?.length > 0 && (
                            <span className="text-gray-500 text-sm ml-1">
                              ({course.ratings.length})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            course.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {course.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <Link
                            to={`/courses/${course._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Course"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Link
                            to={`/courses/${course._id}`}
                            className="text-green-600 hover:text-green-900"
                            title="View Course"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            onClick={() => {
                              setCourseToDelete(course);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Course"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <i className="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Courses Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start creating your first course and share your knowledge with the world.
              </p>
              <Link to="/courses/create" className="btn btn-primary">
                Create Your First Course
              </Link>
            </motion.div>
          )}
        </div>

        {/* Quick Actions & Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((action, index) => (
                <Link
                  key={action.link}
                  to={action.link}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className={`fas fa-${action.icon} text-2xl text-blue-500 mb-2`}></i>
                  <span className="text-sm text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="font-semibold mb-4">Recent Reviews</h3>
            <div className="space-y-4">
              {courses.some(course => course.ratings?.length > 0) ? (
                courses.flatMap(course =>
                  (course.ratings || []).slice(0, 3).map(rating => (
                    <div key={rating._id} className="flex items-start space-x-3">
                      <img
                        src={rating.user.avatar || 'https://via.placeholder.com/32'}
                        alt={rating.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium">{rating.user.name}</span>
                          <div className="text-yellow-500 ml-2">
                            {Array.from({ length: rating.rating }).map((_, i) => (
                              <i key={i} className="fas fa-star text-xs"></i>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{rating.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          on {course.title}
                        </p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}
            </div>
          </motion.div>

          {/* Announcements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="font-semibold mb-4">Announcements</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">New Feature Available</h4>
                <p className="text-sm text-blue-600 mt-1">
                  You can now schedule your course releases in advance!
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">Tips for Success</h4>
                <p className="text-sm text-green-600 mt-1">
                  Regular course updates keep students engaged and improve ratings.
                </p>
              </div>
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
                Are you sure you want to delete "{courseToDelete?.title}"? This action
                cannot be undone.
                {courseToDelete?.enrolledStudents?.length > 0 && (
                  <span className="block mt-2 text-red-600">
                    Warning: This course has {courseToDelete.enrolledStudents.length} enrolled
                    students.
                  </span>
                )}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCourseToDelete(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
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

export default InstructorDashboard;

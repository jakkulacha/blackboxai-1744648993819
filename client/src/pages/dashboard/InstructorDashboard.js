import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourse';
import { useAuth } from '../../hooks/useAuth';
import { ContentLoader } from '../../components/common/LoadingSpinner';
import { EngagementChart, CourseCompletionChart } from '../../components/analytics/DashboardCharts';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { fetchCourses, deleteCourse } = useCourse();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('published');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  // Analytics data states
  const [analyticsData, setAnalyticsData] = useState({
    engagementData: [],
    completionData: []
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await fetchCourses();
      const instructorCourses = response.data.filter(
        course => course.instructor._id === user.id
      );
      setCourses(instructorCourses);
      
      // Generate analytics data
      generateAnalyticsData(instructorCourses);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsData = (courses) => {
    // Generate engagement data for the last 7 days
    const engagementData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activeStudents: Math.floor(Math.random() * 50) + 50 // Simulated active students
      };
    }).reverse();

    // Generate completion data for each course
    const completionData = courses.map(course => ({
      course: course.title.substring(0, 20) + (course.title.length > 20 ? '...' : ''),
      completionRate: Math.floor(Math.random() * 40) + 60 // Simulated completion rate
    }));

    setAnalyticsData({ engagementData, completionData });
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
      toast.success('Course deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const filterCourses = (status) => {
    switch (status) {
      case 'published':
        return courses.filter(course => course.published);
      case 'draft':
        return courses.filter(course => !course.published);
      default:
        return courses;
    }
  };

  const getCoursesStats = () => {
    const totalStudents = courses.reduce(
      (total, course) => total + course.totalEnrolled,
      0
    );
    const totalRevenue = courses.reduce(
      (total, course) => total + (course.price * course.totalEnrolled),
      0
    );
    const averageRating = courses.reduce(
      (total, course) => total + course.averageRating,
      0
    ) / (courses.length || 1);

    return { totalStudents, totalRevenue, averageRating };
  };

  if (loading) {
    return <ContentLoader />;
  }

  const stats = getCoursesStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Instructor Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your courses and track student progress
          </p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link
            to="/courses/create"
            className="btn-primary flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Course
          </Link>
          <Link
            to="/courses/youtube/create"
            className="btn-secondary flex items-center"
          >
            <i className="fab fa-youtube mr-2"></i>
            Import from YouTube
          </Link>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Course Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementChart data={analyticsData.engagementData} />
          <CourseCompletionChart data={analyticsData.completionData} />
        </div>
      </div>

      {/* Stats Overview with improved UI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Courses</h3>
            <i className="fas fa-book text-blue-600 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold">{courses.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Students</h3>
            <i className="fas fa-users text-green-600 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Average Rating</h3>
            <i className="fas fa-star text-yellow-400 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <i className="fas fa-dollar-sign text-green-600 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Courses Section */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['published', 'draft', 'all'].map((tab) => (
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

      {/* Course List with Grid View */}
      <div className="p-6">
        {filterCourses(activeTab).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterCourses(activeTab).map(course => (
              <div key={course._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x200'}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <span className={`
                    absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold
                    ${course.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }
                  `}>
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {course.shortDescription}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Students</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {course.totalEnrolled}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Revenue</div>
                      <div className="text-lg font-semibold text-gray-900">
                        ${(course.price * course.totalEnrolled).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400 mr-1">
                      <i className="fas fa-star"></i>
                    </span>
                    <span className="font-semibold">
                      {course.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 ml-1">
                      ({course.numberOfReviews} reviews)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-x-2">
                      <Link
                        to={`/courses/${course._id}`}
                        className="btn-secondary text-sm"
                      >
                        View
                      </Link>
                      <Link
                        to={`/courses/edit/${course._id}`}
                        className="btn-primary text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                    <button
                      onClick={() => setDeleteConfirm(course._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-book-open text-6xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'published'
                  ? "You don't have any published courses."
                  : activeTab === 'draft'
                  ? "You don't have any draft courses."
                  : "You haven't created any courses yet."}
              </p>
              <Link
                to="/courses/create"
                className="btn-primary inline-flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Your First Course
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Course
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this course? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCourse(deleteConfirm)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCourse } from '../../hooks/useCourse';
import { ContentLoader } from '../../components/common/LoadingSpinner';
import { ProgressChart, TimeSpentChart } from '../../components/analytics/DashboardCharts';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { fetchCourses } = useCourse();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('in-progress');

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  // Analytics data states
  const [analyticsData, setAnalyticsData] = useState({
    progressData: [],
    timeSpentData: []
  });

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await fetchCourses();
      const userEnrolledCourses = response.data.filter(course =>
        user.enrolledCourses.some(
          enrollment => enrollment.course === course._id
        )
      );
      setEnrolledCourses(userEnrolledCourses);
      
      // Generate analytics data
      generateAnalyticsData(userEnrolledCourses);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsData = (courses) => {
    // Generate progress data for the last 7 days
    const progressData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        progress: Math.floor(Math.random() * 30) + 70 // Simulated progress data
      };
    }).reverse();

    // Generate time spent data
    const timeSpentData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: Math.floor(Math.random() * 4) + 1 // Simulated hours spent
      };
    }).reverse();

    setAnalyticsData({ progressData, timeSpentData });
  };

  const getEnrollmentProgress = (courseId) => {
    const enrollment = user.enrolledCourses.find(
      e => e.course === courseId
    );
    return enrollment?.progress || 0;
  };

  const filterCourses = (status) => {
    switch (status) {
      case 'in-progress':
        return enrolledCourses.filter(
          course => getEnrollmentProgress(course._id) < 100
        );
      case 'completed':
        return enrolledCourses.filter(
          course => getEnrollmentProgress(course._id) === 100
        );
      default:
        return enrolledCourses;
    }
  };

  if (loading) {
    return <ContentLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Track your learning progress and continue where you left off.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Courses Enrolled</h3>
            <i className="fas fa-book-open text-blue-600 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold">{enrolledCourses.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Completed Courses</h3>
            <i className="fas fa-graduation-cap text-green-600 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold">
            {enrolledCourses.filter(
              course => getEnrollmentProgress(course._id) === 100
            ).length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Hours Learned</h3>
            <i className="fas fa-clock text-purple-600 text-2xl"></i>
          </div>
          <p className="text-3xl font-bold">
            {enrolledCourses.reduce((total, course) => total + course.duration, 0)}
          </p>
        </div>
      </div>

      {/* Course Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['in-progress', 'completed', 'all'].map((tab) => (
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
                {tab.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Course List */}
        <div className="p-6">
          {filterCourses(activeTab).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterCourses(activeTab).map(course => (
                <div key={course._id} className="course-card">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/300x200'}
                    alt={course.title}
                    className="course-card-image"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.shortDescription}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{getEnrollmentProgress(course._id)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${getEnrollmentProgress(course._id)}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      to={`/courses/${course._id}/lessons`}
                      className="btn-primary w-full text-center"
                    >
                      Continue Learning
                    </Link>
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
                {activeTab === 'in-progress'
                  ? "You don't have any courses in progress."
                  : activeTab === 'completed'
                  ? "You haven't completed any courses yet."
                  : "You haven't enrolled in any courses yet."}
              </p>
              <Link
                to="/courses"
                className="btn-primary inline-flex items-center"
              >
                <i className="fas fa-search mr-2"></i>
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Learning Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressChart data={analyticsData.progressData} />
          <TimeSpentChart data={analyticsData.timeSpentData} />
        </div>
      </div>

      {/* Learning Stats with improved UI */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Learning Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-book-open text-blue-600 text-2xl"></i>
              <span className="text-sm text-blue-600 font-medium">Courses</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {user.enrolledCourses?.length || 0}
            </div>
            <div className="text-sm text-blue-600 mt-2">Total Enrolled</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-check-circle text-green-600 text-2xl"></i>
              <span className="text-sm text-green-600 font-medium">Lessons</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {user.enrolledCourses?.reduce(
                (total, course) => total + (course.completedLessons?.length || 0),
                0
              )}
            </div>
            <div className="text-sm text-green-600 mt-2">Completed</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-trophy text-purple-600 text-2xl"></i>
              <span className="text-sm text-purple-600 font-medium">Achievements</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {user.achievements?.length || 0}
            </div>
            <div className="text-sm text-purple-600 mt-2">Earned</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-certificate text-yellow-600 text-2xl"></i>
              <span className="text-sm text-yellow-600 font-medium">Certificates</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {user.enrolledCourses?.filter(
                course => course.progress === 100
              ).length || 0}
            </div>
            <div className="text-sm text-yellow-600 mt-2">Earned</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

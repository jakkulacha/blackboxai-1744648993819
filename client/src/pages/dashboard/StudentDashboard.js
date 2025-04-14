import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCourse } from '../../hooks/useCourse';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { ProgressChart, TimeSpentChart } from '../../components/analytics/DashboardCharts';

const STATS_CARDS = [
  { id: 'enrolled', label: 'Courses Enrolled', icon: 'book-open', color: 'blue' },
  { id: 'completed', label: 'Completed Courses', icon: 'graduation-cap', color: 'green' },
  { id: 'hours', label: 'Hours Learned', icon: 'clock', color: 'purple' },
  { id: 'streak', label: 'Learning Streak', icon: 'fire', color: 'orange' }
];

const COURSE_TABS = [
  { id: 'in-progress', label: 'In Progress', icon: 'spinner' },
  { id: 'completed', label: 'Completed', icon: 'check-circle' },
  { id: 'bookmarked', label: 'Bookmarked', icon: 'bookmark' },
  { id: 'all', label: 'All Courses', icon: 'th-list' }
];

const ACHIEVEMENTS = [
  { id: 'first-course', title: 'First Course', icon: 'star', color: 'yellow' },
  { id: 'perfect-score', title: 'Perfect Score', icon: 'trophy', color: 'gold' },
  { id: 'fast-learner', title: 'Fast Learner', icon: 'bolt', color: 'blue' },
  { id: 'streak-7', title: '7-Day Streak', icon: 'fire', color: 'red' }
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const { fetchCourses, formatDuration, formatPrice } = useCourse();
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('in-progress');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // Analytics data states
  const [analyticsData, setAnalyticsData] = useState({
    progressData: [],
    timeSpentData: [],
    learningStreak: 0,
    totalHours: 0,
    completionRate: 0,
    recentActivity: []
  });

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

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
        progress: Math.floor(Math.random() * 30) + 70
      };
    }).reverse();

    // Generate time spent data
    const timeSpentData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: Math.floor(Math.random() * 4) + 1
      };
    }).reverse();

    // Calculate total hours
    const totalHours = courses.reduce((total, course) => {
      const enrollment = user.enrolledCourses.find(e => e.course === course._id);
      return total + (enrollment?.timeSpent || 0);
    }, 0);

    // Calculate completion rate
    const completedCourses = courses.filter(
      course => getEnrollmentProgress(course._id) === 100
    ).length;
    const completionRate = (completedCourses / courses.length) * 100;

    setAnalyticsData({
      progressData,
      timeSpentData,
      learningStreak: 7, // Example streak
      totalHours,
      completionRate,
      recentActivity: generateRecentActivity(courses)
    });
  };

  const generateRecentActivity = (courses) => {
    return courses.slice(0, 5).map(course => ({
      id: course._id,
      type: Math.random() > 0.5 ? 'completed_lesson' : 'earned_certificate',
      course: course.title,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    }));
  };

  const getEnrollmentProgress = (courseId) => {
    const enrollment = user.enrolledCourses.find(
      e => e.course === courseId
    );
    return enrollment?.progress || 0;
  };

  const filterCourses = (status) => {
    let filtered = [...enrolledCourses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    switch (status) {
      case 'in-progress':
        filtered = filtered.filter(
          course => getEnrollmentProgress(course._id) < 100
        );
        break;
      case 'completed':
        filtered = filtered.filter(
          course => getEnrollmentProgress(course._id) === 100
        );
        break;
      case 'bookmarked':
        filtered = filtered.filter(
          course => user.bookmarkedCourses?.includes(course._id)
        );
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'progress':
        filtered.sort((a, b) => 
          getEnrollmentProgress(b._id) - getEnrollmentProgress(a._id)
        );
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
        filtered.sort((a, b) => 
          new Date(b.lastAccessed) - new Date(a.lastAccessed)
        );
        break;
    }

    return filtered;
  };

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
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                Track your learning progress and continue where you left off.
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
              className={`bg-gradient-to-br from-${card.color}-50 to-${card.color}-100 rounded-lg p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-${card.color}-600 font-medium`}>{card.label}</h3>
                <div className={`bg-${card.color}-200 p-3 rounded-full`}>
                  <i className={`fas fa-${card.icon} text-${card.color}-600 text-xl`}></i>
                </div>
              </div>
              <p className={`text-3xl font-bold text-${card.color}-600`}>
                {card.id === 'enrolled' ? enrolledCourses.length :
                 card.id === 'completed' ? enrolledCourses.filter(
                   course => getEnrollmentProgress(course._id) === 100
                 ).length :
                 card.id === 'hours' ? analyticsData.totalHours :
                 analyticsData.learningStreak}
              </p>
              <div className={`text-sm text-${card.color}-600 mt-2`}>
                {card.id === 'streak' && 'days in a row'}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Course Management */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          {/* Tabs and Filters */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex space-x-4">
                {COURSE_TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className={`fas fa-${tab.icon} mr-2`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses..."
                    className="form-input pl-10 pr-4 py-2"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                >
                  <option value="recent">Recently Accessed</option>
                  <option value="progress">Progress</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {filterCourses(activeTab).length > 0 ? (
                <motion.div
                  key="course-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filterCourses(activeTab).map((course, index) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                    >
                      <div className="relative">
                        <img
                          src={course.thumbnail || 'https://via.placeholder.com/300x200'}
                          alt={course.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 right-4 space-x-2">
                          <button
                            onClick={() => {/* Toggle bookmark */}}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                          >
                            <i className={`fas fa-bookmark ${
                              user.bookmarkedCourses?.includes(course._id)
                                ? 'text-blue-500'
                                : 'text-gray-400'
                            }`}></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.difficulty}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {formatDuration(course.duration)}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {course.shortDescription}
                        </p>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{getEnrollmentProgress(course._id)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${getEnrollmentProgress(course._id)}%` }}
                              className="h-full bg-blue-500"
                            />
                          </div>
                        </div>

                        <Link
                          to={`/courses/${course._id}/lessons`}
                          className="btn btn-primary w-full flex items-center justify-center"
                        >
                          <i className="fas fa-play-circle mr-2"></i>
                          Continue Learning
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="text-gray-400 mb-4">
                    <i className="fas fa-book-open text-6xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'in-progress'
                      ? "You don't have any courses in progress."
                      : activeTab === 'completed'
                      ? "You haven't completed any courses yet."
                      : activeTab === 'bookmarked'
                      ? "You haven't bookmarked any courses yet."
                      : "You haven't enrolled in any courses yet."}
                  </p>
                  <Link
                    to="/courses"
                    className="btn btn-primary inline-flex items-center"
                  >
                    <i className="fas fa-search mr-2"></i>
                    Browse Courses
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Analytics and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Analytics */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Learning Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProgressChart data={analyticsData.progressData} />
                <TimeSpentChart data={analyticsData.timeSpentData} />
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ACHIEVEMENTS.map((achievement, index) => (
                  <motion.button
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedAchievement(achievement);
                      setShowAchievementModal(true);
                    }}
                    className={`p-4 rounded-lg text-center ${
                      user.achievements?.includes(achievement.id)
                        ? `bg-${achievement.color}-50`
                        : 'bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className={`text-${achievement.color}-500 text-3xl mb-2`}>
                      <i className={`fas fa-${achievement.icon}`}></i>
                    </div>
                    <h3 className="font-medium">{achievement.title}</h3>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {analyticsData.recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className={`p-2 rounded-full ${
                    activity.type === 'completed_lesson'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <i className={`fas fa-${
                      activity.type === 'completed_lesson' ? 'check' : 'certificate'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">
                      {activity.type === 'completed_lesson'
                        ? 'Completed a lesson in'
                        : 'Earned a certificate for'}
                      <span className="font-medium"> {activity.course}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        weekday: 'long',
                        hour: 'numeric',
                        minute: 'numeric'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Modal */}
      <AnimatePresence>
        {showAchievementModal && selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className={`text-${selectedAchievement.color}-500 text-5xl mb-4`}>
                  <i className={`fas fa-${selectedAchievement.icon}`}></i>
                </div>
                <h3 className="text-2xl font-bold mb-2">{selectedAchievement.title}</h3>
                <p className="text-gray-600 mb-6">
                  Achievement unlocked on {new Date().toLocaleDateString()}
                </p>
                <button
                  onClick={() => setShowAchievementModal(false)}
                  className="btn btn-primary"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;

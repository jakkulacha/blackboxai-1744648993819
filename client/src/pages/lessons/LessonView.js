import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { useAuth } from '../../hooks/useAuth';
import { useCourse } from '../../hooks/useCourse';
import { PageLoader } from '../../components/common/LoadingSpinner';

const LessonView = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getCourse,
    getLesson,
    markLessonComplete,
    markLessonIncomplete,
    getNextLesson,
    getPreviousLesson,
    formatDuration,
    calculateProgress
  } = useCourse();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [previousLesson, setPreviousLesson] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef(null);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    loadData();
    // Load saved notes from localStorage
    const savedNotes = localStorage.getItem(`lesson-notes-${lessonId}`);
    if (savedNotes) setNotes(savedNotes);
  }, [courseId, lessonId]);

  // Save notes to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`lesson-notes-${lessonId}`, notes);
  }, [notes, lessonId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [courseData, lessonData] = await Promise.all([
        getCourse(courseId),
        getLesson(courseId, lessonId)
      ]);

      // Check authorization
      if (!courseData.enrolledStudents?.includes(user?._id) && 
          courseData.instructor._id !== user?._id &&
          user?.role !== 'admin') {
        toast.error('You are not enrolled in this course');
        navigate(`/courses/${courseId}`);
        return;
      }

      setCourse(courseData);
      setLesson(lessonData);

      // Get navigation lessons
      const next = getNextLesson(courseData, lessonId);
      const previous = getPreviousLesson(courseData, lessonId);
      setNextLesson(next);
      setPreviousLesson(previous);
    } catch (error) {
      toast.error('Failed to load lesson');
      navigate(`/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await markLessonComplete(lessonId);
      toast.success('Lesson completed!');
      
      if (nextLesson) {
        navigate(`/courses/${courseId}/lessons/${nextLesson._id}`);
      } else {
        toast.success('Congratulations! You\'ve completed the course! 🎉');
        navigate(`/courses/${courseId}`);
      }
    } catch (error) {
      toast.error('Failed to mark lesson as complete');
    }
  };

  const handleVideoProgress = (state) => {
    setVideoProgress(state.played * 100);
    // Auto-complete lesson when video is finished
    if (state.played >= 0.95 && !lesson.completed) {
      handleComplete();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'f') toggleFullscreen();
    if (e.key === ' ') setIsPlaying(!isPlaying);
    if (e.key === 'ArrowRight') playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 10);
    if (e.key === 'ArrowLeft') playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 10);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const renderContent = () => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'youtube':
      case 'video':
        return (
          <div ref={videoContainerRef} className="relative aspect-video">
            <ReactPlayer
              ref={playerRef}
              url={lesson.type === 'youtube' ? lesson.videoUrl : lesson.fileUrl}
              width="100%"
              height="100%"
              controls
              playing={isPlaying}
              onProgress={handleVideoProgress}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              config={{
                youtube: {
                  playerVars: { modestbranding: 1 }
                }
              }}
              className="rounded-lg"
            />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
              <motion.div
                className="h-full bg-blue-600"
                style={{ width: `${videoProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <button
              onClick={toggleFullscreen}
              className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70"
            >
              <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`}></i>
            </button>
          </div>
        );
      case 'pdf':
        return (
          <iframe
            src={lesson.fileUrl}
            title={lesson.title}
            className="w-full h-[calc(100vh-200px)] rounded-lg"
          ></iframe>
        );
      default:
        return (
          <div className="text-center py-12">
            <i className="fas fa-file-alt text-6xl text-gray-400 mb-4"></i>
            <p>This content type is not supported in the preview.</p>
            <a
              href={lesson.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-4"
            >
              Download File
            </a>
          </div>
        );
    }
  };

  if (loading) return <PageLoader />;
  if (!course || !lesson) return null;

  const progress = calculateProgress(course);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to={`/courses/${courseId}`}
                className="text-gray-600 hover:text-gray-900"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Course
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="text-sm text-gray-600">
                Progress: {progress}%
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-gray-600 hover:text-gray-900"
                title="Toggle Notes"
              >
                <i className="fas fa-sticky-note"></i>
              </button>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-gray-600 hover:text-gray-900"
                title="Toggle Sidebar"
              >
                <i className={`fas fa-${showSidebar ? 'times' : 'bars'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className={`${showSidebar ? 'w-3/4' : 'w-full'} space-y-8`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Content */}
              <div className="p-6">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold mb-4"
                >
                  {lesson.title}
                </motion.h1>
                {renderContent()}
                <div className="mt-6 prose max-w-none">
                  <p>{lesson.description}</p>
                </div>

                {/* Resources */}
                {lesson.resources?.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Resources</h3>
                    <div className="space-y-2">
                      {lesson.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <i className="fas fa-file-download text-blue-500 mr-3"></i>
                          <span>{resource.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50">
                <button
                  onClick={() => previousLesson && navigate(`/courses/${courseId}/lessons/${previousLesson._id}`)}
                  className={`btn ${previousLesson ? 'btn-secondary' : 'btn-disabled'}`}
                  disabled={!previousLesson}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Previous
                </button>
                <button
                  onClick={handleComplete}
                  className={`btn ${lesson.completed ? 'btn-success' : 'btn-primary'}`}
                >
                  {lesson.completed ? (
                    <>
                      <i className="fas fa-check-circle mr-2"></i>
                      Completed
                    </>
                  ) : (
                    'Mark as Complete'
                  )}
                </button>
                <button
                  onClick={() => nextLesson && navigate(`/courses/${courseId}/lessons/${nextLesson._id}`)}
                  className={`btn ${nextLesson ? 'btn-secondary' : 'btn-disabled'}`}
                  disabled={!nextLesson}
                >
                  Next
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>

            {/* Notes Section */}
            <AnimatePresence>
              {showNotes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes for this lesson..."
                    className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-1/4"
              >
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Course Content</h2>
                  <div className="space-y-2">
                    {course.lessons.map((l, index) => (
                      <motion.button
                        key={l._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navigate(`/courses/${courseId}/lessons/${l._id}`)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          l._id === lessonId
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="w-6 text-sm text-gray-500">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {l.completed ? (
                            <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          ) : (
                            <i className="far fa-circle text-gray-400 mr-2"></i>
                          )}
                          <span className="flex-1 line-clamp-2">{l.title}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {formatDuration(l.duration)}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LessonView;

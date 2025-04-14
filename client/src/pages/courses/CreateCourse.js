import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCourse } from '../../hooks/useCourse';
import CourseForm from '../../components/courses/CourseForm';
import YouTubeCourseForm from '../../components/courses/YouTubeCourseForm';
import UploadCourseForm from '../../components/courses/UploadCourseForm';

const COURSE_TYPES = [
  {
    id: 'standard',
    title: 'Standard Course',
    description: 'Create a course with mixed content types including videos, documents, and quizzes',
    icon: 'graduation-cap',
    color: 'blue'
  },
  {
    id: 'youtube',
    title: 'YouTube Course',
    description: 'Create a course using your YouTube videos as lessons',
    icon: 'youtube',
    color: 'red'
  },
  {
    id: 'upload',
    title: 'Upload Course',
    description: 'Upload your pre-recorded video content to create a course',
    icon: 'cloud-upload-alt',
    color: 'green'
  }
];

const GUIDELINES = [
  {
    title: 'Course Content',
    items: [
      'Create engaging and high-quality content',
      'Break down complex topics into digestible lessons',
      'Include practical examples and exercises',
      'Provide supplementary resources and materials'
    ],
    icon: 'book'
  },
  {
    title: 'Course Structure',
    items: [
      'Organize content in a logical progression',
      'Keep lessons focused and concise',
      'Include assessments to test understanding',
      'Provide clear learning objectives'
    ],
    icon: 'sitemap'
  },
  {
    title: 'Engagement',
    items: [
      'Use multimedia to enhance learning',
      'Encourage student participation',
      'Provide regular feedback opportunities',
      'Create interactive elements'
    ],
    icon: 'users'
  }
];

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCourse } = useCourse();
  
  const [courseType, setCourseType] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [creating, setCreating] = useState(false);

  // Check if user is authorized to create courses
  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    navigate('/');
    return null;
  }

  const handleCreateCourse = async (courseData) => {
    try {
      setCreating(true);
      const newCourse = await createCourse(courseData);
      toast.success('Course created successfully! 🎉');
      navigate(`/courses/${newCourse._id}/edit`);
    } catch (error) {
      toast.error(error.message || 'Failed to create course');
      setCreating(false);
    }
  };

  const renderCourseForm = () => {
    switch (courseType) {
      case 'youtube':
        return <YouTubeCourseForm onSubmit={handleCreateCourse} />;
      case 'upload':
        return <UploadCourseForm onSubmit={handleCreateCourse} />;
      case 'standard':
        return <CourseForm onSubmit={handleCreateCourse} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-sm text-gray-500 mt-1">
                Start sharing your knowledge with the world
              </p>
            </div>
            <Link
              to="/dashboard/instructor"
              className="btn btn-secondary"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Course Type Selection */}
          {!courseType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {COURSE_TYPES.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCourseType(type.id)}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className={`text-${type.color}-500 text-3xl mb-4`}>
                    <i className={`fab fa-${type.icon}`}></i>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
                  <p className="text-gray-600">{type.description}</p>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Form */}
            <div className={courseType ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <AnimatePresence mode="wait">
                {courseType && (
                  <motion.div
                    key={courseType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="mb-6 flex justify-between items-center">
                      <button
                        onClick={() => setCourseType(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Change Course Type
                      </button>
                      <div className={`text-${COURSE_TYPES.find(t => t.id === courseType)?.color}-500`}>
                        <i className={`fas fa-${COURSE_TYPES.find(t => t.id === courseType)?.icon} mr-2`}></i>
                        {COURSE_TYPES.find(t => t.id === courseType)?.title}
                      </div>
                    </div>
                    {renderCourseForm()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Guidelines Sidebar */}
            {courseType && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {GUIDELINES.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="flex items-center mb-4">
                      <i className={`fas fa-${section.icon} text-blue-500 text-xl mr-3`}></i>
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <motion.li
                          key={itemIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index * 0.1) + (itemIndex * 0.1) }}
                          className="flex items-start"
                        >
                          <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                          <span className="text-gray-600">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}

                {/* Help Resources */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                  <div className="space-y-3">
                    <a
                      href="/instructor-guide"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <i className="fas fa-book mr-2"></i>
                      Instructor Guide
                    </a>
                    <a
                      href="/support"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <i className="fas fa-question-circle mr-2"></i>
                      Support Center
                    </a>
                    <a
                      href="/community"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <i className="fas fa-users mr-2"></i>
                      Instructor Community
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;

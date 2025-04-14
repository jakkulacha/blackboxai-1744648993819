import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { coursesAPI, lessonsAPI, uploadAPI } from '../services/api';

/**
 * Custom hook for managing courses and lessons
 * @returns {Object} Course management methods and states
 */
export const useCourse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Reset error state
  const clearError = () => setError(null);

  // Fetch all courses with optional filters
  const fetchCourses = useCallback(async (params = {}) => {
    setLoading(true);
    clearError();
    try {
      const response = await coursesAPI.getAllCourses(params);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single course by ID
  const fetchCourse = useCallback(async (courseId) => {
    setLoading(true);
    clearError();
    try {
      const response = await coursesAPI.getCourse(courseId);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new course
  const createCourse = async (courseData) => {
    setLoading(true);
    clearError();
    try {
      // Handle thumbnail upload if provided
      if (courseData.thumbnailFile) {
        const uploadResponse = await uploadAPI.uploadImage(
          new FormData().append('file', courseData.thumbnailFile)
        );
        courseData.thumbnail = uploadResponse.data.url;
        delete courseData.thumbnailFile;
      }

      const response = await coursesAPI.createCourse(courseData);
      toast.success('Course created successfully');
      navigate(`/courses/${response.data.data._id}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing course
  const updateCourse = async (courseId, courseData) => {
    setLoading(true);
    clearError();
    try {
      // Handle thumbnail upload if provided
      if (courseData.thumbnailFile) {
        const uploadResponse = await uploadAPI.uploadImage(
          new FormData().append('file', courseData.thumbnailFile)
        );
        courseData.thumbnail = uploadResponse.data.url;
        delete courseData.thumbnailFile;
      }

      const response = await coursesAPI.updateCourse(courseId, courseData);
      toast.success('Course updated successfully');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const deleteCourse = async (courseId) => {
    setLoading(true);
    clearError();
    try {
      await coursesAPI.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      navigate('/dashboard/instructor');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Enroll in course
  const enrollInCourse = async (courseId) => {
    setLoading(true);
    clearError();
    try {
      const response = await coursesAPI.enrollCourse(courseId);
      toast.success('Successfully enrolled in course');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch course lessons
  const fetchCourseLessons = async (courseId) => {
    setLoading(true);
    clearError();
    try {
      const response = await coursesAPI.getCourseLessons(courseId);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lessons');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create new lesson
  const createLesson = async (courseId, lessonData) => {
    setLoading(true);
    clearError();
    try {
      // Handle video upload if provided
      if (lessonData.videoFile) {
        const uploadResponse = await uploadAPI.uploadVideo(
          new FormData().append('file', lessonData.videoFile)
        );
        lessonData.content.videoUrl = uploadResponse.data.url;
        delete lessonData.videoFile;
      }

      // Handle resource uploads if provided
      if (lessonData.resources?.length) {
        const uploadedResources = await Promise.all(
          lessonData.resources.map(async (resource) => {
            if (resource.file) {
              const formData = new FormData();
              formData.append('file', resource.file);
              const uploadResponse = await uploadAPI.uploadResource(formData);
              return {
                ...resource,
                url: uploadResponse.data.url,
                size: uploadResponse.data.size
              };
            }
            return resource;
          })
        );
        lessonData.resources = uploadedResources;
      }

      const response = await lessonsAPI.createLesson(courseId, lessonData);
      toast.success('Lesson created successfully');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update lesson
  const updateLesson = async (lessonId, lessonData) => {
    setLoading(true);
    clearError();
    try {
      // Handle video upload if provided
      if (lessonData.videoFile) {
        const uploadResponse = await uploadAPI.uploadVideo(
          new FormData().append('file', lessonData.videoFile)
        );
        lessonData.content.videoUrl = uploadResponse.data.url;
        delete lessonData.videoFile;
      }

      // Handle resource uploads if provided
      if (lessonData.resources?.length) {
        const uploadedResources = await Promise.all(
          lessonData.resources.map(async (resource) => {
            if (resource.file) {
              const formData = new FormData();
              formData.append('file', resource.file);
              const uploadResponse = await uploadAPI.uploadResource(formData);
              return {
                ...resource,
                url: uploadResponse.data.url,
                size: uploadResponse.data.size
              };
            }
            return resource;
          })
        );
        lessonData.resources = uploadedResources;
      }

      const response = await lessonsAPI.updateLesson(lessonId, lessonData);
      toast.success('Lesson updated successfully');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete lesson
  const deleteLesson = async (lessonId) => {
    setLoading(true);
    clearError();
    try {
      await lessonsAPI.deleteLesson(lessonId);
      toast.success('Lesson deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark lesson as completed
  const completeLesson = async (lessonId, data = {}) => {
    setLoading(true);
    clearError();
    try {
      const response = await lessonsAPI.completeLesson(lessonId, data);
      toast.success('Lesson marked as completed');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Search courses
  const searchCourses = async (query) => {
    setLoading(true);
    clearError();
    try {
      const response = await coursesAPI.searchCourses(query);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search courses');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    clearError,
    // Course methods
    fetchCourses,
    fetchCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    searchCourses,
    // Lesson methods
    fetchCourseLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    completeLesson
  };
};

export default useCourse;

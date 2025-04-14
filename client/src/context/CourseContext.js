import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { coursesAPI, lessonsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const CourseContext = createContext();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const CourseProvider = ({ children }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    price: '',
    rating: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Cache management
  const courseCache = useRef(new Map());
  const lessonCache = useRef(new Map());

  // Clear cache when user changes
  useEffect(() => {
    courseCache.current.clear();
    lessonCache.current.clear();
  }, [user]);

  // Cache helpers
  const getCacheKey = (key, params = {}) => {
    return `${key}-${JSON.stringify(params)}`;
  };

  const getFromCache = (cache, key) => {
    const cached = cache.current.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      cache.current.delete(key);
      return null;
    }
    return cached.data;
  };

  const setInCache = (cache, key, data) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now()
    });
  };

  // Load courses with filtering, pagination, and caching
  const loadCourses = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey('courses', { ...filters, ...pagination, ...params });
      const cached = getFromCache(courseCache, cacheKey);
      
      if (cached) {
        setCourses(cached.courses);
        setPagination(cached.pagination);
        return cached;
      }

      const response = await coursesAPI.getAllCourses({
        ...filters,
        ...pagination,
        ...params
      });

      const { courses: newCourses, pagination: newPagination } = response.data.data;
      setCourses(newCourses);
      setPagination(newPagination);

      setInCache(courseCache, cacheKey, {
        courses: newCourses,
        pagination: newPagination
      });

      return response.data.data;
    } catch (error) {
      setError(error);
      toast.error('Failed to load courses');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  // Load featured and popular courses
  const loadFeaturedCourses = useCallback(async () => {
    try {
      const cached = getFromCache(courseCache, 'featured');
      if (cached) {
        setFeaturedCourses(cached);
        return cached;
      }

      const response = await coursesAPI.getFeaturedCourses();
      setFeaturedCourses(response.data.data);
      setInCache(courseCache, 'featured', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to load featured courses:', error);
    }
  }, []);

  const loadPopularCourses = useCallback(async () => {
    try {
      const cached = getFromCache(courseCache, 'popular');
      if (cached) {
        setPopularCourses(cached);
        return cached;
      }

      const response = await coursesAPI.getPopularCourses();
      setPopularCourses(response.data.data);
      setInCache(courseCache, 'popular', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to load popular courses:', error);
    }
  }, []);

  // Initialize featured and popular courses
  useEffect(() => {
    loadFeaturedCourses();
    loadPopularCourses();
  }, [loadFeaturedCourses, loadPopularCourses]);

  // Filter management
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      level: '',
      price: '',
      rating: '',
      search: ''
    });
  }, []);

  // Course CRUD operations
  const getCourse = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const cached = getFromCache(courseCache, `course-${id}`);
      if (cached) return cached;

      const response = await coursesAPI.getCourse(id);
      setInCache(courseCache, `course-${id}`, response.data.data);
      return response.data.data;
    } catch (error) {
      setError(error);
      toast.error('Failed to load course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.createCourse(courseData);
      setCourses(prev => [response.data.data, ...prev]);
      courseCache.current.clear(); // Clear cache when modifying data
      toast.success('Course created successfully');
      return response.data.data;
    } catch (error) {
      setError(error);
      toast.error('Failed to create course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (id, courseData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.updateCourse(id, courseData);
      setCourses(prev =>
        prev.map(course => course._id === id ? response.data.data : course)
      );
      courseCache.current.clear();
      toast.success('Course updated successfully');
      return response.data.data;
    } catch (error) {
      setError(error);
      toast.error('Failed to update course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await coursesAPI.deleteCourse(id);
      setCourses(prev => prev.filter(course => course._id !== id));
      courseCache.current.clear();
      toast.success('Course deleted successfully');
    } catch (error) {
      setError(error);
      toast.error('Failed to delete course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enrollment management
  const enrollCourse = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.enrollCourse(id);
      setCourses(prev =>
        prev.map(course =>
          course._id === id
            ? { ...course, enrolledStudents: response.data.data.enrolledStudents }
            : course
        )
      );
      courseCache.current.clear();
      toast.success('Successfully enrolled in course');
      return response.data.data;
    } catch (error) {
      setError(error);
      toast.error('Failed to enroll in course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unenrollCourse = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await coursesAPI.unenrollCourse(id);
      setCourses(prev =>
        prev.map(course =>
          course._id === id
            ? { ...course, enrolledStudents: course.enrolledStudents.filter(studentId => studentId !== user?._id) }
            : course
        )
      );
      courseCache.current.clear();
      toast.success('Successfully unenrolled from course');
    } catch (error) {
      setError(error);
      toast.error('Failed to unenroll from course');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Lesson management
  const getLesson = async (courseId, lessonId) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `lesson-${courseId}-${lessonId}`;
      const cached = getFromCache(lessonCache, cacheKey);
      if (cached) return cached;

      const response = await lessonsAPI.getLesson(lessonId);
      setInCache(lessonCache, cacheKey, response.data.data);
      return response.data.data;
    } catch (error) {
      setError(error);
      toast.error('Failed to load lesson');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createLesson = async (courseId, lessonData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await lessonsAPI.createLesson(courseId, lessonData);
      courseCache.current.clear();
      lessonCache.current.clear();
      toast.success('Lesson created successfully');
      return response.data.data;
    } catch (error) {
      setError(error);
      toast.error('Failed to create lesson');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLesson = async (lessonId, lessonData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await lessonsAPI.updateLesson(lessonId, lessonData);
      courseCache.current.clear();
      lessonCache.current.clear();
      toast.success('Lesson updated successfully');
      return response.data.data;
    } catch (error) {
      setError(error);
      toast.error('Failed to update lesson');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    try {
      setLoading(true);
      setError(null);
      await lessonsAPI.deleteLesson(lessonId);
      courseCache.current.clear();
      lessonCache.current.clear();
      toast.success('Lesson deleted successfully');
    } catch (error) {
      setError(error);
      toast.error('Failed to delete lesson');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Progress tracking
  const markLessonComplete = async (lessonId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await lessonsAPI.completeLesson(lessonId);
      lessonCache.current.clear();
      return response.data.data;
    } catch (error) {
      setError(error);
      toast.error('Failed to mark lesson as complete');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markLessonIncomplete = async (lessonId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await lessonsAPI.uncompleteLesson(lessonId);
      lessonCache.current.clear();
      return response.data.data;
    } catch (error) {
      setError(error);
      toast.error('Failed to mark lesson as incomplete');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // State
    courses,
    featuredCourses,
    popularCourses,
    loading,
    error,
    filters,
    pagination,

    // Course operations
    loadCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    
    // Filter management
    updateFilters,
    clearFilters,
    
    // Enrollment
    enrollCourse,
    unenrollCourse,
    
    // Lesson management
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    
    // Progress tracking
    markLessonComplete,
    markLessonIncomplete,

    // Cache management
    clearCache: () => {
      courseCache.current.clear();
      lessonCache.current.clear();
    }
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export default CourseProvider;

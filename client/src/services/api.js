import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * API Configuration
 */
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  retryTimes: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

/**
 * Create axios instance with default config
 */
const api = axios.create(API_CONFIG);

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, code, errors = null) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.errors = errors;
  }
}

/**
 * Retry failed requests
 */
const retryRequest = async (error) => {
  const { config } = error;
  
  if (!config || !config.retry) {
    return Promise.reject(error);
  }

  config.retry -= 1;
  config.retryCount = (config.retryCount || 0) + 1;

  // Delay retry
  const delayRetry = new Promise(resolve => {
    setTimeout(resolve, config.retryDelay || API_CONFIG.retryDelay);
  });

  await delayRetry;
  return api(config);
};

/**
 * Request interceptor
 */
api.interceptors.request.use(
  (config) => {
    // Add retry config
    config.retry = API_CONFIG.retryTimes;
    config.retryDelay = API_CONFIG.retryDelay;

    // Add token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      const networkError = new APIError(
        'Network error. Please check your internet connection.',
        'NETWORK_ERROR'
      );
      toast.error(networkError.message);
      return Promise.reject(networkError);
    }

    // Retry failed requests (except for certain status codes)
    const skipRetryStatus = [401, 403, 422];
    if (
      originalRequest.retry > 0 &&
      !skipRetryStatus.includes(error.response.status) &&
      !originalRequest._retry
    ) {
      return retryRequest(error);
    }

    // Handle specific error cases
    const { status, data } = error.response;
    let apiError;

    switch (status) {
      case 401:
        // Unauthorized - clear local storage and redirect to login
        if (!originalRequest._retry) {
          localStorage.clear(); // Clear all local storage
          apiError = new APIError('Session expired. Please login again.', 'UNAUTHORIZED');
          toast.error(apiError.message);
          window.location.href = '/login';
        }
        break;

      case 403:
        apiError = new APIError(
          'You do not have permission to perform this action',
          'FORBIDDEN'
        );
        toast.error(apiError.message);
        break;

      case 404:
        apiError = new APIError('Resource not found', 'NOT_FOUND');
        toast.error(apiError.message);
        break;

      case 422:
        const validationErrors = data.errors;
        apiError = new APIError(
          'Validation error',
          'VALIDATION_ERROR',
          validationErrors
        );
        if (validationErrors) {
          Object.values(validationErrors).forEach(error => {
            toast.error(error);
          });
        }
        break;

      case 429:
        apiError = new APIError(
          'Too many requests. Please try again later.',
          'RATE_LIMIT'
        );
        toast.error(apiError.message);
        break;

      case 500:
        apiError = new APIError(
          'Server error. Please try again later.',
          'SERVER_ERROR'
        );
        toast.error(apiError.message);
        break;

      default:
        apiError = new APIError(
          data.message || 'An unexpected error occurred',
          'UNKNOWN_ERROR'
        );
        toast.error(apiError.message);
    }

    return Promise.reject(apiError);
  }
);

/**
 * Auth API endpoints
 */
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
  updateNotificationPreferences: (preferences) => api.put('/auth/notifications', preferences),
  deleteAccount: (password) => api.delete('/auth/delete-account', { data: { password } })
};

/**
 * Courses API endpoints
 */
export const coursesAPI = {
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  unenrollCourse: (id) => api.delete(`/courses/${id}/enroll`),
  getEnrolledStudents: (id) => api.get(`/courses/${id}/students`),
  searchCourses: (query) => api.get('/courses/search', { params: { query } }),
  getCourseLessons: (id) => api.get(`/courses/${id}/lessons`),
  getCourseReviews: (id) => api.get(`/courses/${id}/reviews`),
  addCourseReview: (id, review) => api.post(`/courses/${id}/reviews`, review),
  updateCourseReview: (courseId, reviewId, review) => 
    api.put(`/courses/${courseId}/reviews/${reviewId}`, review),
  deleteCourseReview: (courseId, reviewId) => 
    api.delete(`/courses/${courseId}/reviews/${reviewId}`),
  getFeaturedCourses: () => api.get('/courses/featured'),
  getPopularCourses: () => api.get('/courses/popular'),
  getRecommendedCourses: () => api.get('/courses/recommended'),
  getCourseProgress: (id) => api.get(`/courses/${id}/progress`),
  updateCourseProgress: (id, progress) => api.put(`/courses/${id}/progress`, progress)
};

/**
 * Lessons API endpoints
 */
export const lessonsAPI = {
  getLesson: (id) => api.get(`/lessons/${id}`),
  createLesson: (courseId, lessonData) => api.post(`/courses/${courseId}/lessons`, lessonData),
  updateLesson: (id, lessonData) => api.put(`/lessons/${id}`, lessonData),
  deleteLesson: (id) => api.delete(`/lessons/${id}`),
  completeLesson: (id) => api.post(`/lessons/${id}/complete`),
  uncompleteLesson: (id) => api.delete(`/lessons/${id}/complete`),
  getLessonResources: (id) => api.get(`/lessons/${id}/resources`),
  addLessonResource: (id, resource) => api.post(`/lessons/${id}/resources`, resource),
  deleteLessonResource: (lessonId, resourceId) => 
    api.delete(`/lessons/${lessonId}/resources/${resourceId}`),
  getLessonComments: (id) => api.get(`/lessons/${id}/comments`),
  addLessonComment: (id, comment) => api.post(`/lessons/${id}/comments`, comment),
  updateLessonComment: (lessonId, commentId, comment) => 
    api.put(`/lessons/${lessonId}/comments/${commentId}`, comment),
  deleteLessonComment: (lessonId, commentId) => 
    api.delete(`/lessons/${lessonId}/comments/${commentId}`)
};

/**
 * Upload API endpoints with progress tracking
 */
export const uploadAPI = {
  uploadFile: async (file, type = 'image', onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/upload/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },
  uploadImage: (file, onProgress) => uploadAPI.uploadFile(file, 'image', onProgress),
  uploadVideo: (file, onProgress) => uploadAPI.uploadFile(file, 'video', onProgress),
  uploadResource: (file, onProgress) => uploadAPI.uploadFile(file, 'resource', onProgress),
  deleteFile: (fileId) => api.delete(`/upload/${fileId}`)
};

export default api;

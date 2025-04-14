import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your internet connection.');
      return Promise.reject(error);
    }

    // Handle specific error cases
    switch (error.response.status) {
      case 401:
        // Unauthorized - clear local storage and redirect to login
        if (!originalRequest._retry) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        }
        break;
      
      case 403:
        // Forbidden
        toast.error('You do not have permission to perform this action');
        break;
      
      case 404:
        // Not Found
        toast.error('Resource not found');
        break;
      
      case 422:
        // Validation Error
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          Object.values(validationErrors).forEach(error => {
            toast.error(error);
          });
        }
        break;
      
      case 429:
        // Too Many Requests
        toast.error('Too many requests. Please try again later.');
        break;
      
      case 500:
        // Server Error
        toast.error('Server error. Please try again later.');
        break;
      
      default:
        // Handle any other errors
        if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('An unexpected error occurred');
        }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.get('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`)
};

// Courses API calls
export const coursesAPI = {
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  getEnrolledStudents: (id) => api.get(`/courses/${id}/students`),
  searchCourses: (query) => api.get(`/courses?search=${query}`),
  getCourseLessons: (id) => api.get(`/courses/${id}/lessons`)
};

// Lessons API calls
export const lessonsAPI = {
  getLesson: (id) => api.get(`/lessons/${id}`),
  createLesson: (courseId, lessonData) => api.post(`/courses/${courseId}/lessons`, lessonData),
  updateLesson: (id, lessonData) => api.put(`/lessons/${id}`, lessonData),
  deleteLesson: (id) => api.delete(`/lessons/${id}`),
  completeLesson: (id, data) => api.post(`/lessons/${id}/complete`, data)
};

// Upload API calls
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  uploadVideo: (formData) => api.post('/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  uploadResource: (formData) => api.post('/upload/resource', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

// Helper function to handle file uploads with progress
export const uploadWithProgress = async (file, type = 'image', onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post(`/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) {
          onProgress(percentCompleted);
        }
      }
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;

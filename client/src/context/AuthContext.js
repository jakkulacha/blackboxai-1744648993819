import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.data);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success('Registration successful! Please check your email for verification.');
      navigate('/login');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.success('Login successful!');
      navigate(user.role === 'student' ? '/dashboard/student' : '/dashboard/instructor');
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/updatedetails', userData);
      setUser(response.data.data);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/updatepassword', passwordData);
      toast.success('Password changed successfully');
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed';
      toast.error(message);
      throw error;
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset email sent');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send reset email';
      toast.error(message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.error || 'Password reset failed';
      toast.error(message);
      throw error;
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      await api.get(`/auth/verify-email/${token}`);
      toast.success('Email verified successfully');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.error || 'Email verification failed';
      toast.error(message);
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => !!token && !!user;

  // Check if user has required role
  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    hasRole,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

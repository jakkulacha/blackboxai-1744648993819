import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';
import { PageLoader } from '../components/common/LoadingSpinner';

export const AuthContext = createContext();

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Token management
  const setToken = useCallback((token, expiresIn = 86400) => {
    localStorage.setItem(TOKEN_KEY, token);
    const expiryTime = new Date().getTime() + expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const isTokenValid = useCallback(() => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return false;
    return new Date().getTime() < parseInt(expiry);
  }, []);

  // Persist user data
  const persistUser = useCallback((userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check for token and its validity
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && isTokenValid()) {
          // Try to get user data from localStorage first
          const cachedUser = localStorage.getItem(USER_KEY);
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          }

          // Then verify with server
          try {
            const response = await authAPI.getProfile();
            persistUser(response.data.data);
          } catch (error) {
            console.error('Failed to verify token:', error);
            clearToken();
            setUser(null);
          }
        } else {
          clearToken();
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [clearToken, isTokenValid, persistUser]);

  // Auto logout when token expires
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiry = () => {
      if (!isTokenValid()) {
        logout();
        toast.error('Session expired. Please login again.');
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, isTokenValid]);

  // Auth methods
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(credentials);
      const { token, user: userData, expiresIn } = response.data.data;
      setToken(token, expiresIn);
      persistUser(userData);
      return userData;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(userData);
      return response.data.data;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (options = { silent: false }) => {
    try {
      setLoading(true);
      if (!options.silent) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearToken();
      setUser(null);
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.updateProfile(data);
      persistUser(response.data.data);
      toast.success('Profile updated successfully');
      return response.data.data;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.changePassword(data);
      toast.success('Password changed successfully');
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.forgotPassword(email);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, data) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.resetPassword(token, data);
      toast.success('Password reset successful. Please login with your new password.');
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.verifyEmail(token);
      toast.success('Email verified successfully');
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Role and permission checks
  const hasRole = useCallback((requiredRole) => {
    return user?.role === requiredRole;
  }, [user]);

  const hasPermission = useCallback((requiredPermission) => {
    return user?.permissions?.includes(requiredPermission);
  }, [user]);

  const hasAnyRole = useCallback((roles) => {
    return roles.some(role => user?.role === role);
  }, [user]);

  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    initialized,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    hasRole,
    hasPermission,
    hasAnyRole,
    setError
  };

  // Don't render children until auth is initialized
  if (!initialized) {
    return <PageLoader text="Initializing application..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

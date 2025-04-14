import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ProtectedRoute Component
 * Protects routes based on authentication status and user roles
 * 
 * @param {Object} props
 * @param {Array} props.allowedRoles - Array of roles allowed to access the route
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} [props.redirectTo='/login'] - Path to redirect to if unauthorized
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ 
  allowedRoles, 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // If user's role is not allowed, redirect to appropriate dashboard
      const dashboardPath = user.role === 'student' 
        ? '/dashboard/student'
        : '/dashboard/instructor';
      
      return (
        <Navigate 
          to={dashboardPath}
          state={{ 
            from: location.pathname,
            error: 'You do not have permission to access this page'
          }}
          replace 
        />
      );
    }
  }

  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;

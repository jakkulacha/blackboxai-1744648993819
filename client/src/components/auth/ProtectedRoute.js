import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const TRANSITION_DURATION = 0.3;

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

/**
 * Enhanced Protected Route Component
 * Protects routes that require authentication with smooth transitions
 */
const ProtectedRoute = ({ 
  redirectPath = '/login',
  children,
  requireVerified = false,
  showToast = true,
  loadingMessage = 'Checking authentication...'
}) => {
  const { user, loading, error, isVerified } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Show error toast if authentication fails
    if (error && showToast) {
      toast.error('Authentication error. Please try again.');
    }
  }, [error, showToast]);

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        transition={{ duration: TRANSITION_DURATION }}
      >
        <PageLoader text={loadingMessage} theme="glass" />
      </motion.div>
    );
  }

  // Handle authentication errors
  if (error) {
    console.error('Authentication error:', error);
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        transition={{ duration: TRANSITION_DURATION }}
      >
        <Navigate 
          to="/error" 
          state={{ 
            error,
            returnPath: location.pathname 
          }} 
          replace 
        />
      </motion.div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    if (showToast) {
      toast.error('Please log in to access this page');
    }
    return (
      <Navigate 
        to={redirectPath} 
        state={{ 
          from: location,
          message: 'Please log in to access this page'
        }} 
        replace 
      />
    );
  }

  // Check if email verification is required
  if (requireVerified && !isVerified) {
    if (showToast) {
      toast.error('Please verify your email to access this page');
    }
    return (
      <Navigate 
        to="/verify-email" 
        state={{ 
          from: location,
          message: 'Please verify your email to access this page'
        }} 
        replace 
      />
    );
  }

  // Return either children or outlet with animation
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        transition={{ duration: TRANSITION_DURATION }}
      >
        {children ? children : <Outlet />}
      </motion.div>
    </AnimatePresence>
  );
};

ProtectedRoute.propTypes = {
  redirectPath: PropTypes.string,
  children: PropTypes.node,
  requireVerified: PropTypes.bool,
  showToast: PropTypes.bool,
  loadingMessage: PropTypes.string
};

/**
 * Enhanced Role-based Protected Route Component
 * Protects routes that require specific user roles with animations
 */
export const RoleProtectedRoute = ({ 
  allowedRoles,
  redirectPath = '/unauthorized',
  children,
  requireAll = false,
  showToast = true,
  loadingMessage = 'Checking authorization...'
}) => {
  const { user, loading, error, isVerified } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Show error toast if authorization fails
    if (error && showToast) {
      toast.error('Authorization error. Please try again.');
    }
  }, [error, showToast]);

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        transition={{ duration: TRANSITION_DURATION }}
      >
        <PageLoader text={loadingMessage} theme="glass" />
      </motion.div>
    );
  }

  // Handle authentication errors
  if (error) {
    console.error('Authentication error:', error);
    return (
      <Navigate 
        to="/error" 
        state={{ 
          error,
          returnPath: location.pathname 
        }} 
        replace 
      />
    );
  }

  // Check if user is authenticated
  if (!user) {
    if (showToast) {
      toast.error('Please log in to access this page');
    }
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Please log in to access this page'
        }} 
        replace 
      />
    );
  }

  // Check user roles
  const hasRequiredRoles = requireAll
    ? allowedRoles.every(role => user.roles.includes(role))
    : allowedRoles.some(role => user.roles.includes(role));

  if (!hasRequiredRoles) {
    if (showToast) {
      toast.error('You do not have permission to access this page');
    }
    return (
      <Navigate 
        to={redirectPath} 
        state={{ 
          message: 'You do not have permission to access this page',
          requiredRoles: allowedRoles,
          userRoles: user.roles,
          requireAll
        }} 
        replace 
      />
    );
  }

  // Return either children or outlet with animation
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        transition={{ duration: TRANSITION_DURATION }}
      >
        {children ? children : <Outlet />}
      </motion.div>
    </AnimatePresence>
  );
};

RoleProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  redirectPath: PropTypes.string,
  children: PropTypes.node,
  requireAll: PropTypes.bool,
  showToast: PropTypes.bool,
  loadingMessage: PropTypes.string
};

/**
 * Enhanced Guest Only Route Component
 * Protects routes that should only be accessible to non-authenticated users
 */
export const GuestOnlyRoute = ({ 
  redirectPath = '/',
  children,
  showToast = true,
  loadingMessage = 'Checking authentication...'
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        transition={{ duration: TRANSITION_DURATION }}
      >
        <PageLoader text={loadingMessage} theme="glass" />
      </motion.div>
    );
  }

  // If authenticated, redirect to specified path or the page they came from
  if (user) {
    const returnPath = location.state?.from?.pathname || redirectPath;
    if (showToast) {
      toast('You are already logged in', {
        icon: '👋'
      });
    }
    return <Navigate to={returnPath} replace />;
  }

  // Return either children or outlet with animation
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        transition={{ duration: TRANSITION_DURATION }}
      >
        {children ? children : <Outlet />}
      </motion.div>
    </AnimatePresence>
  );
};

GuestOnlyRoute.propTypes = {
  redirectPath: PropTypes.string,
  children: PropTypes.node,
  showToast: PropTypes.bool,
  loadingMessage: PropTypes.string
};

/**
 * Enhanced Subscription Protected Route Component
 * Protects routes that require an active subscription
 */
export const SubscriptionProtectedRoute = ({ 
  requiredPlan,
  redirectPath = '/pricing',
  children,
  allowTrial = false,
  showToast = true,
  loadingMessage = 'Checking subscription...'
}) => {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Show error toast if subscription check fails
    if (error && showToast) {
      toast.error('Error checking subscription status');
    }
  }, [error, showToast]);

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        transition={{ duration: TRANSITION_DURATION }}
      >
        <PageLoader text={loadingMessage} theme="glass" />
      </motion.div>
    );
  }

  // Handle authentication errors
  if (error) {
    console.error('Authentication error:', error);
    return (
      <Navigate 
        to="/error" 
        state={{ 
          error,
          returnPath: location.pathname 
        }} 
        replace 
      />
    );
  }

  // Check if user is authenticated
  if (!user) {
    if (showToast) {
      toast.error('Please log in to access this page');
    }
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Please log in to access this page'
        }} 
        replace 
      />
    );
  }

  // Check subscription status
  const hasValidSubscription = 
    user.subscription?.plan === requiredPlan ||
    (allowTrial && user.subscription?.status === 'trialing');

  if (!hasValidSubscription) {
    if (showToast) {
      toast.error('This page requires a subscription');
    }
    return (
      <Navigate 
        to={redirectPath} 
        state={{ 
          message: 'This page requires a subscription',
          requiredPlan,
          currentPlan: user.subscription?.plan,
          isTrialing: user.subscription?.status === 'trialing'
        }} 
        replace 
      />
    );
  }

  // Return either children or outlet with animation
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        transition={{ duration: TRANSITION_DURATION }}
      >
        {children ? children : <Outlet />}
      </motion.div>
    </AnimatePresence>
  );
};

SubscriptionProtectedRoute.propTypes = {
  requiredPlan: PropTypes.string.isRequired,
  redirectPath: PropTypes.string,
  children: PropTypes.node,
  allowTrial: PropTypes.bool,
  showToast: PropTypes.bool,
  loadingMessage: PropTypes.string
};

export default ProtectedRoute;

/* Usage examples:

// Basic protected route with email verification
<Route 
  element={
    <ProtectedRoute 
      requireVerified={true}
      loadingMessage="Verifying access..."
    />
  }
>
  <Route path="/profile" element={<Profile />} />
</Route>

// Role-based protected route requiring all roles
<Route 
  element={
    <RoleProtectedRoute 
      allowedRoles={['instructor', 'admin']}
      requireAll={true}
      redirectPath="/unauthorized"
      loadingMessage="Checking permissions..."
    />
  }
>
  <Route path="/dashboard/instructor" element={<InstructorDashboard />} />
</Route>

// Guest only route with custom redirect
<Route 
  element={
    <GuestOnlyRoute 
      redirectPath="/dashboard" 
      showToast={false}
    />
  }
>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
</Route>

// Subscription protected route allowing trial access
<Route 
  element={
    <SubscriptionProtectedRoute 
      requiredPlan="pro"
      allowTrial={true}
      redirectPath="/pricing"
      loadingMessage="Verifying subscription..."
    />
  }
>
  <Route path="/pro-features" element={<ProFeatures />} />
</Route>

*/

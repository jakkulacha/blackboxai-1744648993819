import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const SPINNER_VARIANTS = {
  default: {
    border: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: "linear",
        repeat: Infinity
      }
    }
  },
  pulse: {
    scale: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  },
  bounce: {
    bounce: {
      y: ["0%", "-30%", "0%"],
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  }
};

const THEMES = {
  light: {
    spinner: 'border-current',
    text: 'text-gray-700',
    overlay: 'bg-white bg-opacity-80'
  },
  dark: {
    spinner: 'border-current',
    text: 'text-white',
    overlay: 'bg-gray-900 bg-opacity-80'
  },
  glass: {
    spinner: 'border-current',
    text: 'text-gray-900',
    overlay: 'backdrop-blur-sm bg-white/30'
  }
};

/**
 * LoadingSpinner Component
 * Enhanced loading spinner with animations and themes
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text = 'Loading...',
  fullScreen = false,
  overlay = true,
  theme = 'light',
  variant = 'default',
  className = '',
  textClassName = '',
  progress = null,
  showProgress = false
}) => {
  // Size classes mapping
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  // Color classes mapping
  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-cyan-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600'
  };

  // Container classes based on fullScreen prop
  const containerClasses = fullScreen
    ? `fixed inset-0 flex items-center justify-center ${overlay ? THEMES[theme].overlay : ''} z-50`
    : 'flex flex-col items-center justify-center';

  // Combine spinner classes
  const spinnerClasses = `
    ${sizeClasses[size]}
    ${colorClasses[color]}
    rounded-full
    border-4 border-solid
    border-current
    border-r-transparent
    ${className}
  `;

  // Text classes
  const textClasses = `
    mt-4 text-center
    ${THEMES[theme].text}
    ${size === 'sm' || size === 'xs' ? 'text-sm' : 'text-base'}
    ${textClassName}
  `;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={containerClasses}
        role="alert"
        aria-busy="true"
        aria-label={text}
      >
        <div className="relative">
          {/* Main Spinner */}
          <motion.div
            className={spinnerClasses}
            variants={SPINNER_VARIANTS[variant]}
            animate={["border", "scale", "bounce"]}
            role="status"
            aria-hidden="true"
          >
            <span className="sr-only">{text}</span>
          </motion.div>

          {/* Progress Circle */}
          {showProgress && progress !== null && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
              />
              <circle
                className={`${colorClasses[color]} transition-all duration-300`}
                strokeWidth="8"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 * (1 - progress / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
              />
            </svg>
          )}
        </div>
        
        {/* Loading Text */}
        {text && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={textClasses}
          >
            {text}
            {showProgress && progress !== null && (
              <span className="ml-2">({Math.round(progress)}%)</span>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'white',
    'success',
    'danger',
    'warning',
    'info',
    'purple',
    'pink'
  ]),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  theme: PropTypes.oneOf(['light', 'dark', 'glass']),
  variant: PropTypes.oneOf(['default', 'pulse', 'bounce']),
  className: PropTypes.string,
  textClassName: PropTypes.string,
  progress: PropTypes.number,
  showProgress: PropTypes.bool
};

/**
 * PageLoader Component
 * Full-page loading spinner with enhanced overlay
 */
export const PageLoader = ({ text = 'Loading page...', theme = 'glass' }) => (
  <LoadingSpinner
    size="lg"
    color="primary"
    text={text}
    fullScreen
    overlay
    theme={theme}
    variant="pulse"
  />
);

/**
 * ButtonLoader Component
 * Animated inline loading spinner for buttons
 */
export const ButtonLoader = ({ 
  color = 'white',
  size = 'sm',
  className = ''
}) => (
  <LoadingSpinner
    size={size}
    color={color}
    text=""
    variant="bounce"
    className={className}
  />
);

/**
 * ContentLoader Component
 * Enhanced content area loader with progress support
 */
export const ContentLoader = ({ 
  text = 'Loading content...',
  size = 'md',
  color = 'primary',
  className = '',
  textClassName = '',
  progress = null,
  showProgress = false
}) => (
  <div className="flex justify-center items-center p-8">
    <LoadingSpinner
      size={size}
      color={color}
      text={text}
      className={className}
      textClassName={textClassName}
      progress={progress}
      showProgress={showProgress}
      variant="default"
    />
  </div>
);

/**
 * TableLoader Component
 * Enhanced table overlay loader with glass effect
 */
export const TableLoader = ({ text = 'Loading data...' }) => (
  <div className="absolute inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center">
    <LoadingSpinner
      size="md"
      color="primary"
      text={text}
      variant="pulse"
      theme="glass"
    />
  </div>
);

/**
 * InlineLoader Component
 * Minimal inline loading spinner with bounce animation
 */
export const InlineLoader = ({ color = 'primary' }) => (
  <LoadingSpinner
    size="xs"
    color={color}
    text=""
    variant="bounce"
  />
);

/**
 * UploadLoader Component
 * Loading spinner with progress indicator for uploads
 */
export const UploadLoader = ({ progress, text = 'Uploading...' }) => (
  <LoadingSpinner
    size="md"
    color="primary"
    text={text}
    progress={progress}
    showProgress={true}
    variant="default"
  />
);

/**
 * ProcessLoader Component
 * Loading spinner for background processes
 */
export const ProcessLoader = ({ text = 'Processing...', theme = 'dark' }) => (
  <LoadingSpinner
    size="lg"
    color="white"
    text={text}
    fullScreen
    overlay
    theme={theme}
    variant="pulse"
  />
);

// PropTypes for exported components
PageLoader.propTypes = {
  text: PropTypes.string,
  theme: PropTypes.oneOf(['light', 'dark', 'glass'])
};

ButtonLoader.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'white',
    'success',
    'danger',
    'warning',
    'info',
    'purple',
    'pink'
  ]),
  size: PropTypes.oneOf(['xs', 'sm']),
  className: PropTypes.string
};

ContentLoader.propTypes = {
  text: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'white',
    'success',
    'danger',
    'warning',
    'info',
    'purple',
    'pink'
  ]),
  className: PropTypes.string,
  textClassName: PropTypes.string,
  progress: PropTypes.number,
  showProgress: PropTypes.bool
};

TableLoader.propTypes = {
  text: PropTypes.string
};

InlineLoader.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'white',
    'success',
    'danger',
    'warning',
    'info',
    'purple',
    'pink'
  ])
};

UploadLoader.propTypes = {
  progress: PropTypes.number.isRequired,
  text: PropTypes.string
};

ProcessLoader.propTypes = {
  text: PropTypes.string,
  theme: PropTypes.oneOf(['light', 'dark', 'glass'])
};

export default LoadingSpinner;

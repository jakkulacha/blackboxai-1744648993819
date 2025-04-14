import React from 'react';

/**
 * LoadingSpinner Component
 * Displays an animated loading spinner with optional text
 * 
 * @param {Object} props
 * @param {string} [props.size='md'] - Size of the spinner (sm, md, lg)
 * @param {string} [props.color='primary'] - Color theme of the spinner
 * @param {string} [props.text='Loading...'] - Text to display below spinner
 * @param {boolean} [props.fullScreen=false] - Whether to display in full screen
 * @returns {React.ReactNode}
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text = 'Loading...',
  fullScreen = false 
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  // Color classes
  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  // Container classes
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50'
    : 'flex flex-col items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Spinner */}
        <div
          className={`
            ${sizeClasses[size]}
            ${colorClasses[color]}
            animate-spin rounded-full
            border-4 border-solid
            border-current
            border-r-transparent
            align-[-0.125em]
            motion-reduce:animate-[spin_1.5s_linear_infinite]
          `}
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
      
      {/* Loading text */}
      {text && (
        <div className={`
          mt-4 text-center
          ${colorClasses[color]}
          ${size === 'sm' ? 'text-sm' : 'text-base'}
        `}>
          {text}
        </div>
      )}
    </div>
  );
};

/**
 * PageLoader Component
 * Full-page loading spinner with overlay
 */
export const PageLoader = () => (
  <LoadingSpinner
    size="lg"
    color="primary"
    text="Loading page..."
    fullScreen
  />
);

/**
 * ButtonLoader Component
 * Small inline loading spinner for buttons
 */
export const ButtonLoader = ({ color = 'white' }) => (
  <LoadingSpinner
    size="sm"
    color={color}
    text=""
  />
);

/**
 * ContentLoader Component
 * Medium-sized loading spinner for content areas
 */
export const ContentLoader = ({ text = 'Loading content...' }) => (
  <div className="flex justify-center items-center p-8">
    <LoadingSpinner
      size="md"
      color="primary"
      text={text}
    />
  </div>
);

export default LoadingSpinner;

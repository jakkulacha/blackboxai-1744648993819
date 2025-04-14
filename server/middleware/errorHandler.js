const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode;

  // Log error for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let field = Object.keys(err.keyPattern)[0];
    const message = `Duplicate field value entered for ${field}. Please use another value`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    const message = 'Invalid input data';
    error = new ErrorResponse(message, 400, errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again';
    error = new ErrorResponse(message, 401);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size is too large';
    error = new ErrorResponse(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Invalid file type';
    error = new ErrorResponse(message, 400);
  }

  // Handle rate limit exceeded
  if (err.statusCode === 429) {
    const message = 'Too many requests. Please try again later';
    error = new ErrorResponse(message, 429);
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      errors: error.errors || null,
      statusCode: error.statusCode || 500,
      timestamp: new Date().toISOString()
    },
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  // Log error to external service if in production
  if (process.env.NODE_ENV === 'production') {
    // Implement external error logging service here
    // Example: logErrorToService(error);
  }
};

module.exports = errorHandler;

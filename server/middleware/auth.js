const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookie (if using cookie-based auth)
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new ErrorResponse('No user found with this id', 401));
      }

      // Check if user's email is verified
      if (!user.emailVerified) {
        return next(new ErrorResponse('Please verify your email address', 403));
      }

      // Update last active timestamp
      await user.updateLastActive();

      // Add user to request object
      req.user = user;
      next();
    } catch (err) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check course ownership
exports.checkCourseOwnership = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.params.id;
    const course = await req.user.createdCourses.find(
      course => course.toString() === courseId
    );

    if (!course && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          'Not authorized to perform actions on this course',
          403
        )
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Rate limiting middleware
exports.rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};

// Validate request body
exports.validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new ErrorResponse(errorMessage, 400));
    }
    next();
  };
};

// Check if user is enrolled in course
exports.checkEnrollment = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.params.id;
    const enrolled = await req.user.enrolledCourses.find(
      course => course.course.toString() === courseId
    );

    if (!enrolled && req.user.role !== 'instructor') {
      return next(
        new ErrorResponse(
          'You must be enrolled in this course to access its content',
          403
        )
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Sanitize user input
exports.sanitizeInput = (req, res, next) => {
  // Implement input sanitization logic here
  // This is a basic example - enhance based on your needs
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

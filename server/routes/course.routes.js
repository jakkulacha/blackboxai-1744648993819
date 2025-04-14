const express = require('express');
const router = express.Router();
const { protect, authorize, validateRequest } = require('../middleware/auth');
const Joi = require('joi');

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseLessons,
  enrollCourse,
  getEnrolledStudents
} = require('../controllers/course.controller');

// Include lesson routes
const lessonRouter = require('./lesson.routes');
router.use('/:courseId/lessons', lessonRouter);

// Validation schemas
const courseSchema = Joi.object({
  title: Joi.string().required().min(5).max(100),
  description: Joi.string().required().min(20).max(2000),
  shortDescription: Joi.string().required().max(200),
  price: Joi.number().required().min(0),
  discountPrice: Joi.number().min(0),
  category: Joi.string().required().valid(
    'Web Development',
    'Mobile Development',
    'UI/UX',
    'Data Science',
    'Business',
    'Other'
  ),
  subcategories: Joi.array().items(Joi.string()),
  level: Joi.string().required().valid('Beginner', 'Intermediate', 'Advanced'),
  thumbnail: Joi.string(),
  previewVideo: Joi.string(),
  duration: Joi.number().required().min(0),
  learningObjectives: Joi.array().items(Joi.string()).min(1),
  requirements: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
  language: Joi.string().default('English'),
  published: Joi.boolean().default(false)
});

const updateCourseSchema = Joi.object({
  title: Joi.string().min(5).max(100),
  description: Joi.string().min(20).max(2000),
  shortDescription: Joi.string().max(200),
  price: Joi.number().min(0),
  discountPrice: Joi.number().min(0),
  category: Joi.string().valid(
    'Web Development',
    'Mobile Development',
    'UI/UX',
    'Data Science',
    'Business',
    'Other'
  ),
  subcategories: Joi.array().items(Joi.string()),
  level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced'),
  thumbnail: Joi.string(),
  previewVideo: Joi.string(),
  duration: Joi.number().min(0),
  learningObjectives: Joi.array().items(Joi.string()),
  requirements: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
  language: Joi.string(),
  published: Joi.boolean()
}).min(1); // Require at least one field to be updated

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes
router.use(protect); // Apply protection middleware to all routes below

// Student routes
router.post('/:id/enroll', authorize('student'), enrollCourse);

// Instructor routes
router
  .route('/')
  .post(
    authorize('instructor', 'admin'),
    validateRequest(courseSchema),
    createCourse
  );

router
  .route('/:id')
  .put(
    authorize('instructor', 'admin'),
    validateRequest(updateCourseSchema),
    updateCourse
  )
  .delete(authorize('instructor', 'admin'), deleteCourse);

router.get('/:id/lessons', getCourseLessons);
router.get(
  '/:id/students',
  authorize('instructor', 'admin'),
  getEnrolledStudents
);

// Advanced query middleware
router.use((req, res, next) => {
  // Convert query string parameters to MongoDB query
  let query = { ...req.query };
  
  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete query[param]);

  // Create operators ($gt, $gte, etc)
  let queryStr = JSON.stringify(query);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  req.mongoQuery = JSON.parse(queryStr);

  // Select fields
  if (req.query.select) {
    req.select = req.query.select.split(',').join(' ');
  }

  // Sort
  if (req.query.sort) {
    req.sort = req.query.sort.split(',').join(' ');
  } else {
    req.sort = '-createdAt';
  }

  // Pagination
  req.page = parseInt(req.query.page, 10) || 1;
  req.limit = parseInt(req.query.limit, 10) || 10;
  req.startIndex = (req.page - 1) * req.limit;
  req.endIndex = req.page * req.limit;

  next();
});

// Error handling middleware
router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: Object.values(err.errors).map(val => val.message)
    });
  }
  next(err);
});

module.exports = router;

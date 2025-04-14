const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable access to parent router params
const { protect, authorize, validateRequest } = require('../middleware/auth');
const Joi = require('joi');

const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  completeLesson
} = require('../controllers/lesson.controller');

// Validation schemas
const lessonSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(20).max(2000),
  content: Joi.object({
    type: Joi.string().required().valid('video', 'article', 'quiz', 'assignment'),
    videoUrl: Joi.string().when('type', {
      is: 'video',
      then: Joi.required()
    }),
    articleContent: Joi.string().when('type', {
      is: 'article',
      then: Joi.required()
    }),
    quiz: Joi.array().when('type', {
      is: 'quiz',
      then: Joi.required().items(
        Joi.object({
          question: Joi.string().required(),
          options: Joi.array().items(Joi.string()).min(2).required(),
          correctAnswer: Joi.number().required(),
          explanation: Joi.string()
        })
      )
    }),
    assignment: Joi.object().when('type', {
      is: 'assignment',
      then: Joi.required().keys({
        instructions: Joi.string().required(),
        dueDate: Joi.date(),
        maxScore: Joi.number().required()
      })
    })
  }),
  duration: Joi.number().required().min(1),
  order: Joi.number(),
  resources: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      type: Joi.string().required().valid('pdf', 'doc', 'link', 'code', 'github'),
      url: Joi.string().required(),
      description: Joi.string(),
      size: Joi.number()
    })
  ),
  isPreview: Joi.boolean().default(false),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  prerequisites: Joi.array().items(
    Joi.object({
      lesson: Joi.string().required(), // ObjectId
      required: Joi.boolean().default(true)
    })
  )
});

const updateLessonSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(20).max(2000),
  content: Joi.object({
    type: Joi.string().valid('video', 'article', 'quiz', 'assignment'),
    videoUrl: Joi.string(),
    articleContent: Joi.string(),
    quiz: Joi.array().items(
      Joi.object({
        question: Joi.string(),
        options: Joi.array().items(Joi.string()).min(2),
        correctAnswer: Joi.number(),
        explanation: Joi.string()
      })
    ),
    assignment: Joi.object({
      instructions: Joi.string(),
      dueDate: Joi.date(),
      maxScore: Joi.number()
    })
  }),
  duration: Joi.number().min(1),
  order: Joi.number(),
  resources: Joi.array().items(
    Joi.object({
      title: Joi.string(),
      type: Joi.string().valid('pdf', 'doc', 'link', 'code', 'github'),
      url: Joi.string(),
      description: Joi.string(),
      size: Joi.number()
    })
  ),
  isPreview: Joi.boolean(),
  status: Joi.string().valid('draft', 'published', 'archived'),
  prerequisites: Joi.array().items(
    Joi.object({
      lesson: Joi.string(), // ObjectId
      required: Joi.boolean()
    })
  )
}).min(1); // Require at least one field to be updated

const completeLessonSchema = Joi.object({
  timeSpent: Joi.number().min(0),
  score: Joi.number().min(0).max(100) // For quizzes and assignments
});

// Apply protection middleware to all routes
router.use(protect);

// Get all lessons for a course
router.get('/', getLessons);

// Get single lesson
router.get('/:id', getLesson);

// Create new lesson (Instructor only)
router.post(
  '/',
  authorize('instructor', 'admin'),
  validateRequest(lessonSchema),
  createLesson
);

// Update lesson (Instructor only)
router.put(
  '/:id',
  authorize('instructor', 'admin'),
  validateRequest(updateLessonSchema),
  updateLesson
);

// Delete lesson (Instructor only)
router.delete(
  '/:id',
  authorize('instructor', 'admin'),
  deleteLesson
);

// Mark lesson as completed (Students only)
router.post(
  '/:id/complete',
  authorize('student'),
  validateRequest(completeLessonSchema),
  completeLesson
);

// Advanced query middleware
router.use((req, res, next) => {
  // Convert query string parameters to MongoDB query
  let query = { ...req.query };
  
  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];
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
    req.sort = 'order'; // Default sort by lesson order
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

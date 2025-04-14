const express = require('express');
const router = express.Router({ mergeParams: true });
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

// Simplified validation schemas to fix the Joi error
const lessonSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(20).max(2000),
  content: Joi.object({
    type: Joi.string().required().valid('video', 'article', 'quiz', 'assignment'),
    videoUrl: Joi.string(),
    articleContent: Joi.string(),
    quiz: Joi.array(),
    assignment: Joi.object()
  }).required(),
  duration: Joi.number().required().min(1),
  order: Joi.number(),
  isPreview: Joi.boolean().default(false),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft')
});

const updateLessonSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(20).max(2000),
  content: Joi.object({
    type: Joi.string().valid('video', 'article', 'quiz', 'assignment'),
    videoUrl: Joi.string(),
    articleContent: Joi.string(),
    quiz: Joi.array(),
    assignment: Joi.object()
  }),
  duration: Joi.number().min(1),
  order: Joi.number(),
  isPreview: Joi.boolean(),
  status: Joi.string().valid('draft', 'published', 'archived')
}).min(1);

const completeLessonSchema = Joi.object({
  timeSpent: Joi.number().min(0),
  score: Joi.number().min(0).max(100)
});

// Apply protection middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getLessons)
  .post(authorize('instructor', 'admin'), validateRequest(lessonSchema), createLesson);

router.route('/:id')
  .get(getLesson)
  .put(authorize('instructor', 'admin'), validateRequest(updateLessonSchema), updateLesson)
  .delete(authorize('instructor', 'admin'), deleteLesson);

router.post('/:id/complete', authorize('student'), validateRequest(completeLessonSchema), completeLesson);

module.exports = router;

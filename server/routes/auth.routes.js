const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail
} = require('../controllers/auth.controller');

// Input validation middleware
const { validateRequest } = require('../middleware/auth');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
  role: Joi.string().valid('student', 'instructor')
});

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
});

const updateDetailsSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  bio: Joi.string().max(500),
  expertise: Joi.array().items(Joi.string()),
  socialLinks: Joi.object({
    website: Joi.string().uri(),
    linkedin: Joi.string(),
    twitter: Joi.string(),
    github: Joi.string()
  })
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6)
});

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(protect); // Apply protection middleware to all routes below

router.get('/logout', logout);
router.get('/me', getMe);
router.put('/updatedetails', validateRequest(updateDetailsSchema), updateDetails);
router.put('/updatepassword', validateRequest(updatePasswordSchema), updatePassword);

module.exports = router;

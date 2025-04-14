const Course = require('../models/Course');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Course.find(JSON.parse(queryStr))
      .populate({
        path: 'instructor',
        select: 'name email bio expertise'
      });

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ]);
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Course.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const courses = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: courses.length,
      pagination,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'instructor',
        select: 'name email bio expertise'
      })
      .populate({
        path: 'lessons',
        select: 'title description duration isPreview'
      });

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor only)
exports.createCourse = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.instructor = req.user.id;

    // Check for published courses by user
    const publishedCourses = await Course.find({
      instructor: req.user.id,
      published: true
    });

    // If user is not an admin, they can only add 3 published courses
    if (publishedCourses.length >= 3 && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `The user with ID ${req.user.id} has already published the maximum of 3 courses`,
          400
        )
      );
    }

    const course = await Course.create(req.body);

    // Add course to user's createdCourses
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { createdCourses: course._id }
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor only)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this course`,
          401
        )
      );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor only)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this course`,
          401
        )
      );
    }

    // Remove course from instructor's createdCourses
    await User.findByIdAndUpdate(
      course.instructor,
      {
        $pull: { createdCourses: course._id }
      }
    );

    // Remove course from enrolled students
    await User.updateMany(
      { 'enrolledCourses.course': course._id },
      {
        $pull: { enrolledCourses: { course: course._id } }
      }
    );

    // Delete all lessons associated with the course
    await Lesson.deleteMany({ course: course._id });

    // Delete the course
    await course.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course lessons
// @route   GET /api/courses/:id/lessons
// @access  Private (Enrolled students and instructor)
exports.getCourseLessons = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Check if user is enrolled or is the instructor
    const isEnrolled = req.user.enrolledCourses.some(
      enrollment => enrollment.course.toString() === req.params.id
    );
    const isInstructor = course.instructor.toString() === req.user.id;

    if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          'You must be enrolled in this course to access its lessons',
          401
        )
      );
    }

    const lessons = await Lesson.find({ course: req.params.id })
      .sort('order');

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Students only)
exports.enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Check if already enrolled
    const isEnrolled = req.user.enrolledCourses.some(
      enrollment => enrollment.course.toString() === req.params.id
    );

    if (isEnrolled) {
      return next(new ErrorResponse('Already enrolled in this course', 400));
    }

    // Add course to user's enrolledCourses
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          enrolledCourses: {
            course: course._id,
            enrolledAt: Date.now()
          }
        }
      },
      { new: true }
    );

    // Add user to course's enrolledStudents
    course.enrolledStudents.push({
      student: req.user.id,
      enrolledAt: Date.now()
    });
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolled students
// @route   GET /api/courses/:id/students
// @access  Private (Instructor only)
exports.getEnrolledStudents = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'enrolledStudents.student',
        select: 'name email'
      });

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view enrolled students`,
          401
        )
      );
    }

    res.status(200).json({
      success: true,
      count: course.enrolledStudents.length,
      data: course.enrolledStudents
    });
  } catch (error) {
    next(error);
  }
};

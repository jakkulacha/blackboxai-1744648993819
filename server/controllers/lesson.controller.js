const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all lessons for a course
// @route   GET /api/courses/:courseId/lessons
// @access  Private (Enrolled students and instructor)
exports.getLessons = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return next(
        new ErrorResponse(`No course found with id ${req.params.courseId}`, 404)
      );
    }

    // Check if user is enrolled or is the instructor
    const isEnrolled = req.user.enrolledCourses.some(
      enrollment => enrollment.course.toString() === req.params.courseId
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

    const lessons = await Lesson.find({ course: req.params.courseId })
      .sort('order')
      .populate({
        path: 'completedBy.student',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private (Enrolled students and instructor)
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate({
      path: 'course',
      select: 'title instructor'
    });

    if (!lesson) {
      return next(
        new ErrorResponse(`No lesson found with id ${req.params.id}`, 404)
      );
    }

    // Check if user is enrolled or is the instructor
    const isEnrolled = req.user.enrolledCourses.some(
      enrollment => enrollment.course.toString() === lesson.course._id.toString()
    );
    const isInstructor = lesson.course.instructor.toString() === req.user.id;

    if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          'You must be enrolled in this course to access this lesson',
          401
        )
      );
    }

    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lesson
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Instructor only)
exports.createLesson = async (req, res, next) => {
  try {
    req.body.course = req.params.courseId;

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return next(
        new ErrorResponse(`No course found with id ${req.params.courseId}`, 404)
      );
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add a lesson to this course`,
          401
        )
      );
    }

    // Get the current highest order number
    const lastLesson = await Lesson.findOne({ course: req.params.courseId })
      .sort('-order');
    
    // Set the order for the new lesson
    req.body.order = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await Lesson.create(req.body);

    // Add lesson to course
    course.lessons.push(lesson._id);
    await course.save();

    // Update course duration
    course.duration = await calculateCourseDuration(req.params.courseId);
    await course.save();

    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Instructor only)
exports.updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return next(
        new ErrorResponse(`No lesson found with id ${req.params.id}`, 404)
      );
    }

    const course = await Course.findById(lesson.course);

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this lesson`,
          401
        )
      );
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update course duration if lesson duration changed
    if (req.body.duration) {
      course.duration = await calculateCourseDuration(lesson.course);
      await course.save();
    }

    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Instructor only)
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return next(
        new ErrorResponse(`No lesson found with id ${req.params.id}`, 404)
      );
    }

    const course = await Course.findById(lesson.course);

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this lesson`,
          401
        )
      );
    }

    // Remove lesson from course
    course.lessons = course.lessons.filter(
      lessonId => lessonId.toString() !== req.params.id
    );
    await course.save();

    // Delete lesson
    await lesson.remove();

    // Reorder remaining lessons
    await reorderLessons(course._id);

    // Update course duration
    course.duration = await calculateCourseDuration(course._id);
    await course.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/lessons/:id/complete
// @access  Private (Enrolled students only)
exports.completeLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return next(
        new ErrorResponse(`No lesson found with id ${req.params.id}`, 404)
      );
    }

    // Check if user is enrolled in the course
    const isEnrolled = req.user.enrolledCourses.some(
      enrollment => enrollment.course.toString() === lesson.course.toString()
    );

    if (!isEnrolled) {
      return next(
        new ErrorResponse(
          'You must be enrolled in this course to mark lessons as complete',
          401
        )
      );
    }

    // Check if lesson is already completed by user
    const alreadyCompleted = lesson.completedBy.some(
      completion => completion.student.toString() === req.user.id
    );

    if (alreadyCompleted) {
      return next(
        new ErrorResponse('You have already completed this lesson', 400)
      );
    }

    // Add completion record
    await lesson.markAsCompleted(req.user.id, req.body.timeSpent || 0);

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate course duration
const calculateCourseDuration = async (courseId) => {
  const lessons = await Lesson.find({ course: courseId });
  return lessons.reduce((total, lesson) => total + lesson.duration, 0);
};

// Helper function to reorder lessons after deletion
const reorderLessons = async (courseId) => {
  const lessons = await Lesson.find({ course: courseId }).sort('order');
  
  for (let i = 0; i < lessons.length; i++) {
    lessons[i].order = i + 1;
    await lessons[i].save();
  }
};

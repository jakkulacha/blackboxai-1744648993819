const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: '../.env' });

// Load models
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample data
const users = [
  {
    name: 'John Instructor',
    email: 'john@example.com',
    password: 'password123',
    role: 'instructor',
    bio: 'Experienced web development instructor with 10 years of industry experience',
    expertise: ['Web Development', 'JavaScript', 'React'],
    emailVerified: true
  },
  {
    name: 'Jane Student',
    email: 'jane@example.com',
    password: 'password123',
    role: 'student',
    emailVerified: true
  }
];

const courses = [
  {
    title: 'Modern Web Development with React',
    description: 'Learn modern web development using React, including hooks, context, and advanced patterns.',
    shortDescription: 'Comprehensive React course for modern web development',
    price: 99.99,
    category: 'Web Development',
    level: 'Intermediate',
    duration: 20,
    learningObjectives: [
      'Understand React fundamentals',
      'Master hooks and state management',
      'Build real-world applications'
    ],
    requirements: [
      'Basic JavaScript knowledge',
      'Understanding of HTML & CSS'
    ],
    language: 'English',
    published: true
  },
  {
    title: 'Full Stack Development with MERN',
    description: 'Build full-stack applications using MongoDB, Express, React, and Node.js.',
    shortDescription: 'Complete MERN stack development course',
    price: 149.99,
    category: 'Web Development',
    level: 'Advanced',
    duration: 30,
    learningObjectives: [
      'Build complete web applications',
      'Master backend development with Node.js',
      'Implement authentication and authorization'
    ],
    requirements: [
      'JavaScript fundamentals',
      'Basic understanding of web development'
    ],
    language: 'English',
    published: true
  }
];

const lessons = [
  {
    title: 'Introduction to React',
    description: 'Learn the basics of React and its core concepts.',
    content: {
      type: 'video',
      videoUrl: 'https://example.com/intro-to-react'
    },
    duration: 45,
    order: 1,
    isPreview: true,
    status: 'published'
  },
  {
    title: 'React Hooks in Depth',
    description: 'Deep dive into React hooks and their use cases.',
    content: {
      type: 'video',
      videoUrl: 'https://example.com/react-hooks'
    },
    duration: 60,
    order: 2,
    status: 'published'
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();

    console.log('Data cleared...');

    // Create users
    const createdUsers = await Promise.all(
      users.map(async user => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return User.create(user);
      })
    );

    console.log('Users created...');

    // Create courses with instructor reference
    const instructor = createdUsers.find(user => user.role === 'instructor');
    const createdCourses = await Promise.all(
      courses.map(async course => {
        course.instructor = instructor._id;
        return Course.create(course);
      })
    );

    console.log('Courses created...');

    // Create lessons with course reference
    await Promise.all(
      createdCourses.flatMap((course, courseIndex) =>
        lessons.map(async lesson => {
          lesson.course = course._id;
          const createdLesson = await Lesson.create(lesson);

          // Add lesson to course
          await Course.findByIdAndUpdate(course._id, {
            $push: { lessons: createdLesson._id }
          });

          return createdLesson;
        })
      )
    );

    console.log('Lessons created...');

    // Enroll student in first course
    const student = createdUsers.find(user => user.role === 'student');
    await User.findByIdAndUpdate(student._id, {
      $push: {
        enrolledCourses: {
          course: createdCourses[0]._id,
          enrolledAt: Date.now()
        }
      }
    });

    // Add student to course's enrolledStudents
    await Course.findByIdAndUpdate(createdCourses[0]._id, {
      $push: {
        enrolledStudents: {
          student: student._id,
          enrolledAt: Date.now()
        }
      }
    });

    console.log('Student enrolled in course...');

    console.log('Data Import Success');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please provide proper command argument: -i (import) or -d (delete)');
  process.exit();
}

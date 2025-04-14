const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  content: {
    type: {
      type: String,
      enum: ['video', 'article', 'quiz', 'assignment'],
      required: [true, 'Please specify content type']
    },
    videoUrl: String,
    articleContent: String,
    quiz: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    assignment: {
      instructions: String,
      dueDate: Date,
      maxScore: Number
    }
  },
  duration: {
    type: Number,
    required: [true, 'Please add content duration in minutes']
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  resources: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'link', 'code', 'github'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: String,
    size: Number // in KB
  }],
  isPreview: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  completedBy: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: Number, // in minutes
    score: Number // for quizzes and assignments
  }],
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  prerequisites: [{
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lesson'
    },
    required: {
      type: Boolean,
      default: true
    }
  }],
  nextLesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  },
  previousLesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure order is unique within a course
lessonSchema.index({ course: 1, order: 1 }, { unique: true });

// Update timestamps
lessonSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods to manage lesson completion
lessonSchema.methods.markAsCompleted = async function(userId, timeSpent, score = null) {
  const completion = {
    student: userId,
    completedAt: Date.now(),
    timeSpent: timeSpent
  };
  
  if (score !== null) {
    completion.score = score;
  }

  this.completedBy.push(completion);
  await this.save();
  
  // Update course progress
  await this.model('Course').findByIdAndUpdate(
    this.course,
    { $inc: { 'enrolledStudents.$.progress': 1 } },
    { new: true }
  );
};

// Virtual for completion percentage
lessonSchema.virtual('completionRate').get(function() {
  if (!this.course || !this.course.totalEnrolled) return 0;
  return (this.completedBy.length / this.course.totalEnrolled) * 100;
});

// Virtual for average score (for quizzes and assignments)
lessonSchema.virtual('averageScore').get(function() {
  if (this.completedBy.length === 0 || !this.completedBy.some(c => c.score)) return 0;
  const scores = this.completedBy.filter(c => c.score);
  return scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length;
});

module.exports = mongoose.model('Lesson', lessonSchema);

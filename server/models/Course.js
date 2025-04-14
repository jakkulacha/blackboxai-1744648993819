const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    unique: true
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Please add a short description'],
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be greater than or equal to 0']
  },
  discountPrice: {
    type: Number,
    validate: {
      validator: function(v) {
        return v < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },
  subcategories: [{
    type: String
  }],
  level: {
    type: String,
    required: [true, 'Please add a difficulty level'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  thumbnail: {
    type: String,
    default: 'default-course.jpg'
  },
  previewVideo: {
    type: String
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  lessons: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson'
  }],
  totalLessons: {
    type: Number,
    default: 0
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  totalEnrolled: {
    type: Number,
    default: 0
  },
  ratings: [{
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    review: String,
    reviewer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    required: [true, 'Please add course duration in hours']
  },
  learningObjectives: [{
    type: String,
    required: true
  }],
  requirements: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  language: {
    type: String,
    required: [true, 'Please specify course language'],
    default: 'English'
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  featured: {
    type: Boolean,
    default: false
  },
  certificate: {
    available: {
      type: Boolean,
      default: false
    },
    template: String
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

// Create course slug from the title
courseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

// Update timestamps
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate average rating
courseSchema.methods.getAverageRating = function() {
  if (this.ratings.length === 0) return 0;
  
  const sum = this.ratings.reduce((acc, item) => item.rating + acc, 0);
  this.averageRating = sum / this.ratings.length;
  return this.averageRating;
};

// Update total enrolled count
courseSchema.methods.updateEnrollmentCount = function() {
  this.totalEnrolled = this.enrolledStudents.length;
  return this.save();
};

// Update total lessons count
courseSchema.methods.updateLessonCount = function() {
  this.totalLessons = this.lessons.length;
  return this.save();
};

// Virtual populate lessons
courseSchema.virtual('lessonsList', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

module.exports = mongoose.model('Course', courseSchema);

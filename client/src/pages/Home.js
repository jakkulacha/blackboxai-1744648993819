import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  // Featured courses data (in a real app, this would come from an API)
  const featuredCourses = [
    {
      id: 1,
      title: 'Web Development Bootcamp',
      instructor: 'John Doe',
      rating: 4.8,
      students: 1234,
      image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      instructor: 'Jane Smith',
      rating: 4.7,
      students: 987,
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg'
    },
    {
      id: 3,
      title: 'Data Science Fundamentals',
      instructor: 'Mike Johnson',
      rating: 4.9,
      students: 2345,
      image: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Learn Without Limits
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Access world-class education from anywhere. Start learning today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to={`/dashboard/${user.role}`}
                  className="btn-primary text-lg px-8 py-3"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-3"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/courses"
                    className="btn bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                  >
                    Browse Courses
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EduLearn?
            </h2>
            <p className="text-xl text-gray-600">
              Discover the benefits of learning with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <i className="fas fa-laptop-code text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from industry professionals with real-world experience
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <i className="fas fa-clock text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Learn at Your Pace</h3>
              <p className="text-gray-600">
                Access course content anytime, anywhere, on any device
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <i className="fas fa-certificate text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Certified</h3>
              <p className="text-gray-600">
                Earn certificates upon completion of our courses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600">
              Start your learning journey with our top-rated courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <div key={course.id} className="course-card">
                <img
                  src={course.image}
                  alt={course.title}
                  className="course-card-image"
                />
                <div className="course-card-content">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-2">by {course.instructor}</p>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-400 mr-1">
                      <i className="fas fa-star"></i>
                    </span>
                    <span className="font-medium">{course.rating}</span>
                    <span className="text-gray-600 ml-2">
                      ({course.students} students)
                    </span>
                  </div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="btn-primary block text-center mt-4"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="btn-secondary text-lg px-8 py-3"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of students already learning on EduLearn
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="btn bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Sign Up Now
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Expert Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Online Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

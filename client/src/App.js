import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import ProtectedRoute, { RoleProtectedRoute } from './components/auth/ProtectedRoute';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CourseList from './pages/courses/CourseList';
import CourseDetails from './pages/courses/CourseDetails';
import NotFound from './pages/NotFound';

// Protected Pages
import Profile from './pages/profile/Profile';
import CreateCourse from './pages/courses/CreateCourse';
import EditCourse from './pages/courses/EditCourse';
import LessonView from './pages/lessons/LessonView';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CourseProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow bg-gray-50">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/courses" element={<CourseList />} />
                  <Route path="/courses/:id" element={<CourseDetails />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route
                      path="/courses/:courseId/lessons/:lessonId"
                      element={<LessonView />}
                    />
                  </Route>

                  {/* Instructor Routes */}
                  <Route
                    element={
                      <RoleProtectedRoute allowedRoles={['instructor', 'admin']} />
                    }
                  >
                    <Route path="/courses/create" element={<CreateCourse />} />
                    <Route path="/courses/:id/edit" element={<EditCourse />} />
                    <Route
                      path="/dashboard/instructor"
                      element={<InstructorDashboard />}
                    />
                  </Route>

                  {/* Student Routes */}
                  <Route
                    element={
                      <RoleProtectedRoute allowedRoles={['student', 'admin']} />
                    }
                  >
                    <Route
                      path="/dashboard/student"
                      element={<StudentDashboard />}
                    />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CourseProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

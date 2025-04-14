import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import YouTubeCourseForm from './components/courses/YouTubeCourseForm';
import UploadCourseForm from './components/courses/UploadCourseForm';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CourseList from './pages/courses/CourseList';
import CourseDetails from './pages/courses/CourseDetails';
import NotFound from './pages/NotFound';

// Protected Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import CreateCourse from './pages/courses/CreateCourse';
import EditCourse from './pages/courses/EditCourse';

import LessonView from './pages/lessons/LessonView';
import Profile from './pages/profile/Profile';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetails />} />

              <Route
                path="/dashboard/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/instructor"
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/create"
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <UploadCourseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/youtube/create"
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <YouTubeCourseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <EditCourse />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

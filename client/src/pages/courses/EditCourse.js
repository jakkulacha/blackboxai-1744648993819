import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourse';
import CourseForm from '../../components/courses/CourseForm';
import { ContentLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCourse, loading, error } = useCourse();
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await fetchCourse(id);
        setCourseData(response.data);
      } catch (err) {
        toast.error('Failed to load course details');
        navigate('/courses');
      }
    };

    loadCourse();
  }, [id, fetchCourse, navigate]);

  if (loading) {
    return <ContentLoader />;
  }

  if (error || !courseData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Course</h1>
      <CourseForm courseData={courseData} />
    </div>
  );
};

export default EditCourse;

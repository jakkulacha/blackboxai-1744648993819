import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourse';
import { ButtonLoader } from '../common/LoadingSpinner';

const CourseForm = ({ courseData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: '',
    price: 0,
    duration: 0,
    thumbnailFile: null,
    published: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createCourse, updateCourse } = useCourse();
  const navigate = useNavigate();

  useEffect(() => {
    if (courseData) {
      setFormData({
        title: courseData.title,
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        duration: courseData.duration,
        thumbnailFile: null,
        published: courseData.published,
      });
    }
  }, [courseData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (courseData) {
        await updateCourse(courseData._id, formData);
        navigate(`/courses/${courseData._id}`);
      } else {
        await createCourse(formData);
        navigate('/courses');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-4">
        {courseData ? 'Edit Course' : 'Create New Course'}
      </h2>
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Course Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter course title"
          />
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Course Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter course description"
            rows="4"
          />
        </div>

        {/* Short Description Field */}
        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
            Short Description
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            required
            value={formData.shortDescription}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter a short description for the course"
            rows="2"
          />
        </div>

        {/* Category Field */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select a category</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="UI/UX">UI/UX</option>
            <option value="Data Science">Data Science</option>
            <option value="Business">Business</option>
          </select>
        </div>

        {/* Level Field */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700">
            Level
          </label>
          <select
            id="level"
            name="level"
            required
            value={formData.level}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select a level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Price Field */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            value={formData.price}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter course price"
          />
        </div>

        {/* Duration Field */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (in hours)
          </label>
          <input
            id="duration"
            name="duration"
            type="number"
            required
            value={formData.duration}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter course duration"
          />
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
            Course Thumbnail
          </label>
          <input
            id="thumbnail"
            name="thumbnailFile"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center">
          <input
            id="published"
            name="published"
            type="checkbox"
            checked={formData.published}
            onChange={() => setFormData(prev => ({ ...prev, published: !prev.published }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
            Publish this course
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <ButtonLoader color="white" /> : (courseData ? 'Update Course' : 'Create Course')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourse';
import toast from 'react-hot-toast';

const UploadCourseForm = () => {
  const navigate = useNavigate();
  const { createCourse } = useCourse();
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    category: '',
    level: 'Beginner',
    thumbnail: null,
    previewVideo: null,
    learningObjectives: [''],
    requirements: [''],
    language: 'English'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleArrayInputChange = (index, field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create FormData object to handle file uploads
      const formData = new FormData();
      Object.keys(courseData).forEach(key => {
        if (key === 'thumbnail' || key === 'previewVideo') {
          if (courseData[key]) {
            formData.append(key, courseData[key]);
          }
        } else if (Array.isArray(courseData[key])) {
          courseData[key].forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else {
          formData.append(key, courseData[key]);
        }
      });

      await createCourse(formData);
      toast.success('Course created successfully');
      navigate('/dashboard/instructor');
    } catch (error) {
      toast.error('Failed to create course');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload New Course</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Title */}
        <div>
          <label className="form-label">Course Title</label>
          <input
            type="text"
            name="title"
            value={courseData.title}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            className="form-input h-32"
            required
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="form-label">Short Description</label>
          <textarea
            name="shortDescription"
            value={courseData.shortDescription}
            onChange={handleInputChange}
            className="form-input"
            maxLength={200}
            required
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="form-label">Course Thumbnail</label>
          <input
            type="file"
            name="thumbnail"
            onChange={handleFileChange}
            accept="image/*"
            className="form-input"
            required
          />
        </div>

        {/* Preview Video */}
        <div>
          <label className="form-label">Preview Video</label>
          <input
            type="file"
            name="previewVideo"
            onChange={handleFileChange}
            accept="video/*"
            className="form-input"
          />
        </div>

        {/* Price */}
        <div>
          <label className="form-label">Price ($)</label>
          <input
            type="number"
            name="price"
            value={courseData.price}
            onChange={handleInputChange}
            className="form-input"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="form-label">Category</label>
          <select
            name="category"
            value={courseData.category}
            onChange={handleInputChange}
            className="form-input"
            required
          >
            <option value="">Select Category</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="UI/UX">UI/UX</option>
            <option value="Data Science">Data Science</option>
            <option value="Business">Business</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="form-label">Level</label>
          <select
            name="level"
            value={courseData.level}
            onChange={handleInputChange}
            className="form-input"
            required
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Learning Objectives */}
        <div>
          <label className="form-label">Learning Objectives</label>
          {courseData.learningObjectives.map((objective, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => handleArrayInputChange(index, 'learningObjectives', e.target.value)}
                className="form-input flex-grow"
                placeholder="What students will learn..."
                required
              />
              <button
                type="button"
                onClick={() => removeArrayField('learningObjectives', index)}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('learningObjectives')}
            className="btn-secondary mt-2"
          >
            Add Learning Objective
          </button>
        </div>

        {/* Requirements */}
        <div>
          <label className="form-label">Requirements</label>
          {courseData.requirements.map((requirement, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={requirement}
                onChange={(e) => handleArrayInputChange(index, 'requirements', e.target.value)}
                className="form-input flex-grow"
                placeholder="Prior knowledge required..."
              />
              <button
                type="button"
                onClick={() => removeArrayField('requirements', index)}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('requirements')}
            className="btn-secondary mt-2"
          >
            Add Requirement
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating Course...
              </>
            ) : (
              'Create Course'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadCourseForm;

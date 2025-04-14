import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourse } from '../../hooks/useCourse';
import { uploadAPI } from '../../services/api';
import { ButtonLoader } from '../../components/common/LoadingSpinner';

const CATEGORY_OPTIONS = [
  { value: 'programming', label: 'Programming', icon: 'code' },
  { value: 'design', label: 'Design', icon: 'palette' },
  { value: 'business', label: 'Business', icon: 'briefcase' },
  { value: 'marketing', label: 'Marketing', icon: 'bullhorn' },
  { value: 'photography', label: 'Photography', icon: 'camera' },
  { value: 'music', label: 'Music', icon: 'music' },
  { value: 'health', label: 'Health & Fitness', icon: 'heartbeat' },
  { value: 'language', label: 'Languages', icon: 'language' }
];

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner', icon: 'seedling' },
  { value: 'intermediate', label: 'Intermediate', icon: 'tree' },
  { value: 'advanced', label: 'Advanced', icon: 'mountain' },
  { value: 'expert', label: 'Expert', icon: 'crown' }
];

const CourseForm = ({ initialData, mode = 'create' }) => {
  const navigate = useNavigate();
  const { createCourse, updateCourse } = useCourse();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'programming',
    level: 'beginner',
    price: 0,
    originalPrice: 0,
    thumbnail: '',
    previewVideo: '',
    duration: 0,
    learningObjectives: [''],
    requirements: [''],
    features: [''],
    tags: [],
    isPublished: false,
    isFeatured: false,
    allowPreview: true
  });

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        learningObjectives: initialData.learningObjectives?.length ? initialData.learningObjectives : [''],
        requirements: initialData.requirements?.length ? initialData.requirements : [''],
        features: initialData.features?.length ? initialData.features : [''],
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    } else if (formData.shortDescription.length > 150) {
      newErrors.shortDescription = 'Short description must be less than 150 characters';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.duration < 0) {
      newErrors.duration = 'Duration cannot be negative';
    }

    if (!formData.thumbnail) {
      newErrors.thumbnail = 'Course thumbnail is required';
    }

    if (!formData.learningObjectives.some(obj => obj.trim())) {
      newErrors.learningObjectives = 'At least one learning objective is required';
    }

    if (!formData.requirements.some(req => req.trim())) {
      newErrors.requirements = 'At least one requirement is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsDirty(true);
  };

  // Handle rich text editor changes
  const handleEditorChange = (value) => {
    setFormData(prev => ({
      ...prev,
      description: value
    }));
    setIsDirty(true);
  };

  // Handle array field changes
  const handleArrayChange = (index, value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
    setIsDirty(true);
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  // Handle tag management
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      e.preventDefault();
      const newTag = e.target.value.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.target.value = '';
      setIsDirty(true);
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    setIsDirty(true);
  };

  // Handle file uploads
  const handleFileUpload = async (e, type = 'image') => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size should be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      const response = await uploadAPI.uploadFile(file, type, (progress) => {
        setUploadProgress(progress);
      });

      setFormData(prev => ({
        ...prev,
        [type === 'image' ? 'thumbnail' : 'previewVideo']: response.url
      }));
      
      toast.success('File uploaded successfully');
      setIsDirty(true);
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    // Clean up form data
    const cleanedData = {
      ...formData,
      learningObjectives: formData.learningObjectives.filter(item => item.trim()),
      requirements: formData.requirements.filter(item => item.trim()),
      features: formData.features.filter(item => item.trim())
    };

    try {
      setLoading(true);
      if (mode === 'edit') {
        await updateCourse(initialData._id, cleanedData);
        toast.success('Course updated successfully');
      } else {
        const newCourse = await createCourse(cleanedData);
        toast.success('Course created successfully');
        navigate(`/courses/${newCourse._id}/edit`);
      }
      setIsDirty(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="form-label required">Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter an engaging course title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label className="form-label required">Short Description</label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className={`form-input ${errors.shortDescription ? 'border-red-500' : ''}`}
              placeholder="Brief description (appears in course cards)"
              maxLength={150}
            />
            <div className="flex justify-between mt-1">
              <p className={errors.shortDescription ? 'text-red-500 text-sm' : 'text-gray-500 text-sm'}>
                {errors.shortDescription || `${formData.shortDescription.length}/150 characters`}
              </p>
            </div>
          </div>

          {/* Full Description */}
          <div>
            <label className="form-label required">Full Description</label>
            <ReactQuill
              value={formData.description}
              onChange={handleEditorChange}
              className={errors.description ? 'border-red-500' : ''}
              theme="snow"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Course Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="form-label">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="form-select"
            >
              {LEVEL_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="form-label">Regular Price ($)</label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>

          {/* Sale Price */}
          <div>
            <label className="form-label">Sale Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`form-input ${errors.price ? 'border-red-500' : ''}`}
              min="0"
              step="0.01"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="form-label">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`form-input ${errors.duration ? 'border-red-500' : ''}`}
              min="0"
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="form-checkbox"
              />
              <label className="ml-2">Publish course</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="form-checkbox"
              />
              <label className="ml-2">Feature on homepage</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="allowPreview"
                checked={formData.allowPreview}
                onChange={handleChange}
                className="form-checkbox"
              />
              <label className="ml-2">Allow preview before purchase</label>
            </div>
          </div>
        </div>
      </section>

      {/* Media */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Media</h3>

        <div className="space-y-6">
          {/* Thumbnail Upload */}
          <div>
            <label className="form-label required">Course Thumbnail</label>
            <div className="flex items-center space-x-4">
              {formData.thumbnail && (
                <img
                  src={formData.thumbnail}
                  alt="Course thumbnail"
                  className="w-32 h-32 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="btn btn-secondary cursor-pointer"
                >
                  {formData.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
                </label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {errors.thumbnail && (
              <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>
            )}
          </div>

          {/* Preview Video Upload */}
          <div>
            <label className="form-label">Preview Video</label>
            <div className="flex items-center space-x-4">
              {formData.previewVideo && (
                <video
                  src={formData.previewVideo}
                  className="w-48 rounded"
                  controls
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="btn btn-secondary cursor-pointer"
                >
                  {formData.previewVideo ? 'Change Video' : 'Upload Video'}
                </label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Course Content</h3>

        {/* Learning Objectives */}
        <div className="mb-6">
          <label className="form-label required">Learning Objectives</label>
          <AnimatePresence>
            {formData.learningObjectives.map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-2 mb-2"
              >
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'learningObjectives')}
                  className={`form-input flex-1 ${
                    errors.learningObjectives ? 'border-red-500' : ''
                  }`}
                  placeholder="What students will learn"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, 'learningObjectives')}
                  className="text-red-500 hover:text-red-700"
                  disabled={formData.learningObjectives.length <= 1}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => addArrayItem('learningObjectives')}
            className="text-blue-600 hover:text-blue-800"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Learning Objective
          </button>
          {errors.learningObjectives && (
            <p className="text-red-500 text-sm mt-1">{errors.learningObjectives}</p>
          )}
        </div>

        {/* Requirements */}
        <div className="mb-6">
          <label className="form-label required">Requirements</label>
          <AnimatePresence>
            {formData.requirements.map((requirement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-2 mb-2"
              >
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                  className={`form-input flex-1 ${
                    errors.requirements ? 'border-red-500' : ''
                  }`}
                  placeholder="What students need to know"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, 'requirements')}
                  className="text-red-500 hover:text-red-700"
                  disabled={formData.requirements.length <= 1}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => addArrayItem('requirements')}
            className="text-blue-600 hover:text-blue-800"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Requirement
          </button>
          {errors.requirements && (
            <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>
          )}
        </div>

        {/* Features */}
        <div className="mb-6">
          <label className="form-label">Course Features</label>
          <AnimatePresence>
            {formData.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-2 mb-2"
              >
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'features')}
                  className="form-input flex-1"
                  placeholder="What's included in the course"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, 'features')}
                  className="text-red-500 hover:text-red-700"
                  disabled={formData.features.length <= 1}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => addArrayItem('features')}
            className="text-blue-600 hover:text-blue-800"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Feature
          </button>
        </div>

        {/* Tags */}
        <div>
          <label className="form-label">Tags</label>
          <input
            type="text"
            onKeyDown={handleTagInput}
            className="form-input"
            placeholder="Type and press Enter to add tags"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <AnimatePresence>
              {formData.tags.map((tag) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !isDirty}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <ButtonLoader />
              <span className="ml-2">
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </span>
            </>
          ) : (
            <>{mode === 'edit' ? 'Update Course' : 'Create Course'}</>
          )}
        </button>
      </div>
    </form>
  );
};

CourseForm.propTypes = {
  initialData: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    shortDescription: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    level: PropTypes.string,
    price: PropTypes.number,
    originalPrice: PropTypes.number,
    thumbnail: PropTypes.string,
    previewVideo: PropTypes.string,
    duration: PropTypes.number,
    learningObjectives: PropTypes.arrayOf(PropTypes.string),
    requirements: PropTypes.arrayOf(PropTypes.string),
    features: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    isPublished: PropTypes.bool,
    isFeatured: PropTypes.bool,
    allowPreview: PropTypes.bool
  }),
  mode: PropTypes.oneOf(['create', 'edit'])
};

export default CourseForm;

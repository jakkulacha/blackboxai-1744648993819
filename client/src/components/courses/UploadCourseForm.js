import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

const ACCEPTED_FILE_TYPES = {
  video: {
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm']
  },
  document: {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
  }
};

const FILE_TYPE_ICONS = {
  'video/mp4': { icon: 'video', color: 'blue' },
  'video/webm': { icon: 'video', color: 'blue' },
  'application/pdf': { icon: 'file-pdf', color: 'red' },
  'application/msword': { icon: 'file-word', color: 'blue' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'file-word', color: 'blue' },
  'application/vnd.ms-powerpoint': { icon: 'file-powerpoint', color: 'orange' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: 'file-powerpoint', color: 'orange' }
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const UploadCourseForm = ({ onSubmit, initialData }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(initialData?.fileUrl || '');
  const [isDragActive, setIsDragActive] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    file: null,
    duration: initialData?.duration || '',
    order: initialData?.order || 1,
    type: initialData?.type || 'video',
    resources: initialData?.resources || []
  });

  // Handle file drop
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        if (file.size > MAX_FILE_SIZE) {
          return 'File size must be less than 100MB';
        }
        return 'Invalid file type';
      });
      toast.error(errors[0]);
      return;
    }

    const file = acceptedFiles[0];
    handleFileSelect(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { ...ACCEPTED_FILE_TYPES.video, ...ACCEPTED_FILE_TYPES.document },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  });

  const handleFileSelect = (file) => {
    setFormData(prev => ({ ...prev, file }));
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-detect duration for video files
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        setFormData(prev => ({
          ...prev,
          duration: Math.ceil(video.duration / 60) // Convert to minutes
        }));
      };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleResourceChange = (index, field, value) => {
    const updatedResources = [...formData.resources];
    updatedResources[index] = { ...updatedResources[index], [field]: value };
    setFormData(prev => ({ ...prev, resources: updatedResources }));
  };

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { title: '', url: '' }]
    }));
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.file && !initialData?.fileUrl) errors.file = 'File is required';
    if (!formData.duration) errors.duration = 'Duration is required';

    formData.resources.forEach((resource, index) => {
      if (resource.title && !resource.url) {
        errors[`resourceUrl${index}`] = 'Resource URL is required';
      }
      if (!resource.title && resource.url) {
        errors[`resourceTitle${index}`] = 'Resource title is required';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setLoading(true);
      const submitData = new FormData();

      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'file' && key !== 'resources') {
          submitData.append(key, formData[key]);
        }
      });

      // Append file if present
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      // Append resources as JSON
      submitData.append('resources', JSON.stringify(formData.resources));

      await onSubmit(submitData, (progress) => {
        setUploadProgress(progress);
      });

      toast.success(initialData ? 'Lesson updated successfully' : 'Lesson added successfully');

      // Reset form if it's a new lesson
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          shortDescription: '',
          file: null,
          duration: '',
          order: formData.order + 1,
          type: 'video',
          resources: []
        });
        setPreviewUrl('');
        setUploadProgress(0);
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getFileTypeInfo = (file) => {
    return FILE_TYPE_ICONS[file?.type] || { icon: 'file', color: 'gray' };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="form-label required">Lesson Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${validationErrors.title ? 'border-red-500' : ''}`}
              placeholder="Enter lesson title"
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
            )}
          </div>

          <div>
            <label className="form-label">Short Description</label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className="form-input"
              placeholder="Brief description (appears in lesson list)"
              maxLength={100}
            />
          </div>

          <div>
            <label className="form-label required">Full Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`form-input ${validationErrors.description ? 'border-red-500' : ''}`}
              placeholder="Detailed lesson description"
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Content Upload</h3>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={() => setIsDragActive(true)}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={() => setIsDragActive(false)}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
            <div>
              <p className="text-lg font-medium">
                Drag and drop your file here, or{' '}
                <span className="text-blue-600 hover:text-blue-800 cursor-pointer">browse</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: MP4, WEBM, PDF, DOC, DOCX, PPT, PPTX (max 100MB)
              </p>
            </div>
          </div>
        </div>

        {/* File Preview */}
        <AnimatePresence>
          {(formData.file || previewUrl) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">File Preview</h4>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, file: null }));
                    setPreviewUrl('');
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {formData.file?.type.startsWith('video/') ? (
                <video
                  ref={videoRef}
                  src={previewUrl}
                  controls
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="flex items-center p-4 bg-white rounded-lg">
                  <i className={`fas fa-${getFileTypeInfo(formData.file).icon} text-3xl text-${getFileTypeInfo(formData.file).color}-500 mr-4`}></i>
                  <div>
                    <p className="font-medium">{formData.file?.name}</p>
                    <p className="text-sm text-gray-500">
                      {(formData.file?.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Additional Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label required">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`form-input ${validationErrors.duration ? 'border-red-500' : ''}`}
              min="1"
            />
            {validationErrors.duration && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.duration}</p>
            )}
          </div>

          <div>
            <label className="form-label">Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="form-input"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Additional Resources</h3>
          <button
            type="button"
            onClick={addResource}
            className="btn btn-secondary btn-sm"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Resource
          </button>
        </div>

        <AnimatePresence>
          {formData.resources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4 mb-4"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={resource.title}
                  onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                  className={`form-input ${validationErrors[`resourceTitle${index}`] ? 'border-red-500' : ''}`}
                  placeholder="Resource title"
                />
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  value={resource.url}
                  onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                  className={`form-input ${validationErrors[`resourceUrl${index}`] ? 'border-red-500' : ''}`}
                  placeholder="Resource URL"
                />
              </div>
              <button
                type="button"
                onClick={() => removeResource(index)}
                className="text-red-500 hover:text-red-700"
              >
                <i className="fas fa-trash"></i>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              {initialData ? 'Updating Lesson...' : 'Adding Lesson...'}
            </>
          ) : (
            <>{initialData ? 'Update Lesson' : 'Add Lesson'}</>
          )}
        </button>
      </div>
    </form>
  );
};

UploadCourseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    shortDescription: PropTypes.string,
    fileUrl: PropTypes.string,
    duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    order: PropTypes.number,
    type: PropTypes.string,
    resources: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        url: PropTypes.string
      })
    )
  })
};

export default UploadCourseForm;

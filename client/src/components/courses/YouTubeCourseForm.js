import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player/youtube';
import { useCourse } from '../../hooks/useCourse';

const YouTubeCourseForm = ({ onSubmit, initialData }) => {
  const { formatDuration } = useCourse();
  const [loading, setLoading] = useState(false);
  const [fetchingPlaylist, setFetchingPlaylist] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    category: initialData?.category || '',
    level: initialData?.level || 'beginner',
    price: initialData?.price || 0,
    thumbnail: initialData?.thumbnail || '',
    lessons: initialData?.lessons || [],
    learningObjectives: initialData?.learningObjectives || [''],
    requirements: initialData?.requirements || [''],
    tags: initialData?.tags || []
  });

  // Validate YouTube URL
  const validateYouTubeUrl = (url) => {
    const playlistRegex = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
    return playlistRegex.test(url);
  };

  // Extract playlist ID from URL
  const extractPlaylistId = (url) => {
    const match = url.match(/[&?]list=([^&]+)/i);
    return match ? match[1] : null;
  };

  // Fetch playlist data from YouTube API
  const fetchPlaylistData = async () => {
    if (!validateYouTubeUrl(playlistUrl)) {
      toast.error('Please enter a valid YouTube playlist URL');
      return;
    }

    try {
      setFetchingPlaylist(true);
      const playlistId = extractPlaylistId(playlistUrl);
      
      // Here you would typically make an API call to your backend
      // which would then use the YouTube Data API to fetch playlist details
      const response = await fetch(`/api/youtube/playlist/${playlistId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      // Update form with playlist data
      setFormData(prev => ({
        ...prev,
        title: data.title,
        description: data.description,
        shortDescription: data.description.slice(0, 150),
        thumbnail: data.thumbnail,
        lessons: data.videos.map((video, index) => ({
          title: video.title,
          description: video.description,
          videoUrl: `https://www.youtube.com/embed/${video.videoId}`,
          duration: video.duration,
          order: index + 1,
          type: 'youtube'
        }))
      }));

      toast.success('Playlist data fetched successfully');
    } catch (error) {
      toast.error('Failed to fetch playlist data');
      console.error('Playlist fetch error:', error);
    } finally {
      setFetchingPlaylist(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayInputChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleLessonReorder = (dragIndex, dropIndex) => {
    const newLessons = [...formData.lessons];
    const [draggedLesson] = newLessons.splice(dragIndex, 1);
    newLessons.splice(dropIndex, 0, draggedLesson);
    
    // Update order property
    const reorderedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));

    setFormData(prev => ({ ...prev, lessons: reorderedLessons }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.shortDescription.trim()) errors.shortDescription = 'Short description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.lessons.length) errors.lessons = 'At least one lesson is required';
    if (!formData.learningObjectives.some(obj => obj.trim())) {
      errors.learningObjectives = 'At least one learning objective is required';
    }
    if (!formData.requirements.some(req => req.trim())) {
      errors.requirements = 'At least one requirement is required';
    }

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
      await onSubmit(formData);
    } catch (error) {
      toast.error('Failed to create course');
      console.error('Course creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Playlist URL Input */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">YouTube Playlist</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="url"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              placeholder="Enter YouTube playlist URL"
              className="form-input w-full"
              disabled={loading || fetchingPlaylist}
            />
          </div>
          <button
            type="button"
            onClick={fetchPlaylistData}
            disabled={loading || fetchingPlaylist || !playlistUrl}
            className="btn btn-primary"
          >
            {fetchingPlaylist ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Fetching...
              </>
            ) : (
              <>
                <i className="fas fa-download mr-2"></i>
                Import Playlist
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="form-label required">Course Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.title ? 'border-red-500' : ''}`}
                placeholder="Enter course title"
              />
              {validationErrors.title && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label className="form-label required">Short Description</label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.shortDescription ? 'border-red-500' : ''}`}
                placeholder="Brief description (appears in course cards)"
                maxLength={150}
              />
              {validationErrors.shortDescription && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.shortDescription}</p>
              )}
            </div>

            <div>
              <label className="form-label required">Full Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`form-input h-32 ${validationErrors.description ? 'border-red-500' : ''}`}
                placeholder="Detailed course description"
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Course Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label required">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Select Category</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
              </select>
              {validationErrors.category && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>
              )}
            </div>

            <div>
              <label className="form-label">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Lessons</h3>
          
          {formData.lessons.length > 0 ? (
            <div className="space-y-4">
              {formData.lessons.map((lesson, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-4">
                        {String(lesson.order).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-gray-500">
                          {formatDuration(lesson.duration)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setPreviewVideo(lesson.videoUrl)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <i className="fas fa-play"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLessonReorder(index, index - 1)}
                        disabled={index === 0}
                        className={`text-gray-600 hover:text-gray-800 ${
                          index === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <i className="fas fa-arrow-up"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLessonReorder(index, index + 1)}
                        disabled={index === formData.lessons.length - 1}
                        className={`text-gray-600 hover:text-gray-800 ${
                          index === formData.lessons.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <i className="fas fa-arrow-down"></i>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-film text-4xl mb-2"></i>
              <p>No lessons added yet. Import a YouTube playlist to get started.</p>
            </div>
          )}
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Learning Objectives</h3>
          
          <div className="space-y-2">
            {formData.learningObjectives.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => handleArrayInputChange(index, 'learningObjectives', e.target.value)}
                  className={`form-input flex-1 ${
                    validationErrors.learningObjectives ? 'border-red-500' : ''
                  }`}
                  placeholder="What students will learn..."
                />
                <button
                  type="button"
                  onClick={() => removeArrayField('learningObjectives', index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={formData.learningObjectives.length <= 1}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('learningObjectives')}
              className="btn btn-secondary mt-2"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Learning Objective
            </button>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Requirements</h3>
          
          <div className="space-y-2">
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => handleArrayInputChange(index, 'requirements', e.target.value)}
                  className={`form-input flex-1 ${
                    validationErrors.requirements ? 'border-red-500' : ''
                  }`}
                  placeholder="What students need to know..."
                />
                <button
                  type="button"
                  onClick={() => removeArrayField('requirements', index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={formData.requirements.length <= 1}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('requirements')}
              className="btn btn-secondary mt-2"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Requirement
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || fetchingPlaylist}
            className="btn btn-primary"
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

      {/* Video Preview Modal */}
      <AnimatePresence>
        {previewVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4"
            >
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="aspect-video">
                <ReactPlayer
                  url={previewVideo}
                  width="100%"
                  height="100%"
                  controls
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

YouTubeCourseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    shortDescription: PropTypes.string,
    category: PropTypes.string,
    level: PropTypes.string,
    price: PropTypes.number,
    thumbnail: PropTypes.string,
    lessons: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        videoUrl: PropTypes.string,
        duration: PropTypes.number,
        order: PropTypes.number
      })
    ),
    learningObjectives: PropTypes.arrayOf(PropTypes.string),
    requirements: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string)
  })
};

export default YouTubeCourseForm;

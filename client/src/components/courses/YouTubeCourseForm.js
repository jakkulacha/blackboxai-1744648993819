import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourse';
import toast from 'react-hot-toast';

const YouTubeCourseForm = () => {
  const navigate = useNavigate();
  const { createCourse } = useCourse();
  const [loading, setLoading] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [courseDetails, setCourseDetails] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    category: '',
    level: 'Beginner',
    learningObjectives: [''],
    requirements: [''],
    language: 'English'
  });

  const extractPlaylistId = (url) => {
    const regex = /[?&]list=([^#\&\?]+)/;
    const match = url.match(regex);
    return match && match[1];
  };

  const fetchPlaylistData = async () => {
    try {
      const playlistId = extractPlaylistId(playlistUrl);
      if (!playlistId) {
        toast.error('Invalid YouTube playlist URL');
        return;
      }

      setLoading(true);
      // Here you would integrate with YouTube Data API
      // For now, we'll just validate the URL format
      const response = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=YOUR_API_KEY`);
      const data = await response.json();

      if (data.items && data.items[0]) {
        const playlist = data.items[0].snippet;
        setCourseDetails(prev => ({
          ...prev,
          title: playlist.title,
          description: playlist.description,
          shortDescription: playlist.description.substring(0, 200)
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch playlist data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (index, field, value) => {
    setCourseDetails(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setCourseDetails(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setCourseDetails(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const playlistId = extractPlaylistId(playlistUrl);
      if (!playlistId) {
        toast.error('Invalid YouTube playlist URL');
        return;
      }

      // Create course with YouTube playlist data
      const courseData = {
        ...courseDetails,
        content: {
          type: 'youtube_playlist',
          playlistId: playlistId,
          playlistUrl: playlistUrl
        }
      };

      await createCourse(courseData);
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
      <h2 className="text-2xl font-bold mb-6">Create YouTube Course</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* YouTube Playlist URL */}
        <div>
          <label className="form-label">YouTube Playlist URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              className="form-input flex-grow"
              placeholder="https://www.youtube.com/playlist?list=..."
              required
            />
            <button
              type="button"
              onClick={fetchPlaylistData}
              className="btn-secondary"
              disabled={loading}
            >
              Fetch Details
            </button>
          </div>
        </div>

        {/* Course Title */}
        <div>
          <label className="form-label">Course Title</label>
          <input
            type="text"
            name="title"
            value={courseDetails.title}
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
            value={courseDetails.description}
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
            value={courseDetails.shortDescription}
            onChange={handleInputChange}
            className="form-input"
            maxLength={200}
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="form-label">Price ($)</label>
          <input
            type="number"
            name="price"
            value={courseDetails.price}
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
            value={courseDetails.category}
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
            value={courseDetails.level}
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
          {courseDetails.learningObjectives.map((objective, index) => (
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
          {courseDetails.requirements.map((requirement, index) => (
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

export default YouTubeCourseForm;

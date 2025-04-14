import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCourse } from '../../hooks/useCourse';
import { PageLoader } from '../../components/common/LoadingSpinner';

const TABS = [
  { id: 'general', label: 'General', icon: 'user' },
  { id: 'security', label: 'Security', icon: 'shield-alt' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'billing', label: 'Billing', icon: 'credit-card' }
];

const Profile = () => {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const { getUserCourses } = useCourse();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    website: user?.website || '',
    title: user?.title || '',
    location: user?.location || '',
    skills: user?.skills || [],
    social: {
      twitter: user?.social?.twitter || '',
      linkedin: user?.social?.linkedin || '',
      github: user?.social?.github || '',
      youtube: user?.social?.youtube || ''
    },
    preferences: {
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      marketingEmails: user?.preferences?.marketingEmails ?? false,
      publicProfile: user?.preferences?.publicProfile ?? true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('social.')) {
      const [_, field] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        social: { ...prev.social, [field]: value }
      }));
    } else if (name.startsWith('preferences.')) {
      const [_, field] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [field]: checked }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size and type
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setLoading(true);
      // Here you would typically upload the file to your storage service
      // and get back the URL
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress);
        }
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);

      setProfileData(prev => ({ ...prev, avatar: data.url }));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to upload profile picture');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const validateProfile = () => {
    const errors = {};

    if (!profileData.name.trim()) errors.name = 'Name is required';
    if (!profileData.email.trim()) errors.email = 'Email is required';
    if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Invalid email address';
    }
    if (profileData.website && !/^https?:\/\//.test(profileData.website)) {
      errors.website = 'Website must start with http:// or https://';
    }

    Object.entries(profileData.social).forEach(([platform, url]) => {
      if (url && !/^https?:\/\//.test(url)) {
        errors[`social.${platform}`] = `${platform} URL must start with http:// or https://`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setLoading(true);
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setLoading(true);
      await changePassword(passwordData);
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.email) {
      toast.error('Email confirmation does not match');
      return;
    }

    try {
      setLoading(true);
      await deleteAccount();
      toast.success('Account deleted successfully');
      // Redirect to home page will be handled by auth context
    } catch (error) {
      toast.error(error.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  if (!user) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profileData.avatar || 'https://via.placeholder.com/150'}
                  alt={profileData.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-camera"></i>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-1 ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <i className={`fas fa-${tab.icon}`}></i>
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'general' && (
                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label required">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className={`form-input ${validationErrors.name ? 'border-red-500' : ''}`}
                        />
                        {validationErrors.name && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label required">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className={`form-input ${validationErrors.email ? 'border-red-500' : ''}`}
                        />
                        {validationErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Professional Title</label>
                        <input
                          type="text"
                          name="title"
                          value={profileData.title}
                          onChange={handleProfileChange}
                          className="form-input"
                          placeholder="e.g. Senior Software Engineer"
                        />
                      </div>

                      <div>
                        <label className="form-label">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={profileData.location}
                          onChange={handleProfileChange}
                          className="form-input"
                          placeholder="e.g. San Francisco, CA"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">About</h2>
                    <div>
                      <label className="form-label">Bio</label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows="4"
                        className="form-input"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Social Links</h2>
                    <div className="space-y-4">
                      {Object.entries(profileData.social).map(([platform, url]) => (
                        <div key={platform}>
                          <div className="flex items-center">
                            <i className={`fab fa-${platform} text-2xl w-10 ${
                              platform === 'twitter' ? 'text-blue-400' :
                              platform === 'linkedin' ? 'text-blue-700' :
                              platform === 'github' ? 'text-gray-900' :
                              platform === 'youtube' ? 'text-red-600' : ''
                            }`}></i>
                            <input
                              type="url"
                              name={`social.${platform}`}
                              value={url}
                              onChange={handleProfileChange}
                              className={`form-input flex-1 ${
                                validationErrors[`social.${platform}`] ? 'border-red-500' : ''
                              }`}
                              placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} profile URL`}
                            />
                          </div>
                          {validationErrors[`social.${platform}`] && (
                            <p className="text-red-500 text-sm mt-1 ml-10">
                              {validationErrors[`social.${platform}`]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
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
                          Saving Changes...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  {/* Password Change */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="form-label required">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`form-input ${
                            validationErrors.currentPassword ? 'border-red-500' : ''
                          }`}
                        />
                        {validationErrors.currentPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="form-label required">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`form-input ${
                            validationErrors.newPassword ? 'border-red-500' : ''
                          }`}
                        />
                        {validationErrors.newPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.newPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="form-label required">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`form-input ${
                            validationErrors.confirmPassword ? 'border-red-500' : ''
                          }`}
                        />
                        {validationErrors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.confirmPassword}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn btn-primary"
                        >
                          {loading ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Changing Password...
                            </>
                          ) : (
                            'Change Password'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
                        <p className="text-gray-600 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="btn btn-secondary">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Active Sessions</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <i className="fas fa-laptop text-gray-500"></i>
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-500">Last active: Just now</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-gray-600 text-sm">
                          Receive notifications about your courses and account
                        </p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="preferences.emailNotifications"
                          checked={profileData.preferences.emailNotifications}
                          onChange={handleProfileChange}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Marketing Emails</h3>
                        <p className="text-gray-600 text-sm">
                          Receive updates about new courses and features
                        </p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="preferences.marketingEmails"
                          checked={profileData.preferences.marketingEmails}
                          onChange={handleProfileChange}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Public Profile</h3>
                        <p className="text-gray-600 text-sm">
                          Allow others to view your profile and achievements
                        </p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="preferences.publicProfile"
                          checked={profileData.preferences.publicProfile}
                          onChange={handleProfileChange}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8">
                  {/* Payment Methods */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
                    <button className="btn btn-secondary">
                      <i className="fas fa-plus mr-2"></i>
                      Add Payment Method
                    </button>
                  </div>

                  {/* Billing History */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Billing History</h2>
                    <div className="text-center text-gray-500 py-8">
                      <i className="fas fa-receipt text-4xl mb-4"></i>
                      <p>No billing history available</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white rounded-lg shadow-sm p-6 border-t-4 border-red-500"
          >
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-gray-600">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-danger"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </p>
              <div className="mb-4">
                <label className="form-label">
                  Please type <span className="font-medium">{user.email}</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="form-input"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || deleteConfirmation !== user.email}
                  className="btn btn-danger"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;

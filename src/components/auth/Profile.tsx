'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiEdit3, FiSave, FiX, FiCamera } from 'react-icons/fi';
import '@/styles/components/auth/Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Update local user when context user changes
  React.useEffect(() => {
    setLocalUser(user);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (localUser) {
      const updatedUser = {
        ...localUser,
        ...formData
      };
      // Update local user state
      setLocalUser(updatedUser);
      localStorage.setItem('fefa_user', JSON.stringify(updatedUser));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: localUser?.firstName || '',
      lastName: localUser?.lastName || '',
      email: localUser?.email || '',
      phone: localUser?.phone || '',
    });
    setIsEditing(false);
  };

  if (!localUser) return null;

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-container">
              <div className="avatar">
                <FiUser className="avatar-icon" />
              </div>
              <button className="avatar-edit-btn">
                <FiCamera className="w-4 h-4" />
              </button>
            </div>
            <div className="avatar-info">
              <h2 className="user-name">
                {localUser.firstName} {localUser.lastName}
              </h2>
              <p className="user-email">{localUser.email}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="form-section">
            <div className="form-header">
              <h3 className="form-title">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-btn"
                >
                  <FiEdit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="form-actions">
                  <button
                    onClick={handleSave}
                    className="save-btn"
                  >
                    <FiSave className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="cancel-btn"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="form-grid">
              {/* First Name */}
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <div className="input-container">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <div className="input-container">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-container">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <div className="input-container">
                  <FiPhone className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="stats-section">
            <h3 className="stats-title">Account Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Orders</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Wishlist Items</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">0</div>
                <div className="stat-label">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







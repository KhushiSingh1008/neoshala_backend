import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import '../pages/ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: ''
  });

  // Load user data when component mounts
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.displayName?.split(' ')[0] || '',
        lastName: currentUser.displayName?.split(' ')[1] || '',
        email: currentUser.email || '',
        bio: 'I love learning new skills!' // Default or fetch from Firestore
      });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        displayName: `${formData.firstName} ${formData.lastName}`,
        bio: formData.bio
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!currentUser) {
    return <div className="profile-container">Please log in to view your profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
            </div>
          )}
        </div>
        <h2>{currentUser.displayName || 'User'}</h2>
        <span className="user-role">{userRole}</span>
      </div>

      <div className="profile-content">
        {editMode ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
              />
            </div>
            
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setEditMode(false)}>
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{formData.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role:</span>
                <span className="info-value">{userRole}</span>
              </div>
              <div className="info-item bio-item">
                <span className="info-label">Bio:</span>
                <p className="info-value">{formData.bio}</p>
              </div>
            </div>
            
            <div className="profile-actions">
              <button 
                onClick={() => setEditMode(true)} 
                className="edit-button"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>

      {userRole === 'instructor' && (
        <div className="instructor-stats">
          <h3>Instructor Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">12</span>
              <span className="stat-label">Courses Created</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">1,245</span>
              <span className="stat-label">Students Enrolled</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">4.8</span>
              <span className="stat-label">Average Rating</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
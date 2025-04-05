import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadProfilePicture } from '../services/api';
import { toast } from 'react-toastify';
import { Course, User } from '../types';
import { fetchInstructorCourses } from '../services/courseService';
import './ProfilePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfilePage: React.FC = () => {
  const { user, token, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState('/default-profile.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.profilePicture) {
      const url = `${import.meta.env.VITE_API_URL}${user.profilePicture}`;
      setProfilePictureUrl(url);
    } else {
      setProfilePictureUrl('/default-profile.png');
    }
  }, [user?.profilePicture]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?._id || !token || isLoadingCourses) return;
      
      try {
        setIsLoadingCourses(true);
        
        // Fetch created courses if user is an instructor
        if (user.role === 'instructor') {
          const createdResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/instructor/${user._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (createdResponse.ok) {
            const createdData = await createdResponse.json();
            setCreatedCourses(createdData);
          }
        }
        
        // Fetch enrolled courses for all users
        const enrolledResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/student/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (enrolledResponse.ok) {
          const enrolledData = await enrolledResponse.json();
          setEnrolledCourses(enrolledData);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [user?._id, user?.role, token]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({
      username: user?.username || '',
      email: user?.email || '',
      location: user?.location || '',
      age: user?.age || '',
      bio: user?.bio || ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'age') {
      setEditedUser(prev => ({
        ...prev,
        age: value === '' ? undefined : Number(value)
      }));
    } else {
      setEditedUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user?._id || !token) return;

    try {
      setIsUpdatingPicture(true);
      const formData = new FormData();
      formData.append('profilePicture', e.target.files[0]);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update profile picture');

      const data = await response.json();
      if (updateUserData && data.user) {
        updateUserData(data.user);
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    } finally {
      setIsUpdatingPicture(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user?._id) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedUser)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();
      if (updateUserData) {
        updateUserData(data.user);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture-container">
          <img
            src={profilePictureUrl}
            alt="Profile"
            className={`profile-picture ${isUpdatingPicture ? 'updating' : ''}`}
            onError={() => setProfilePictureUrl('/default-profile.png')}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUpdatingPicture}
            className="change-picture-btn"
          >
            {isUpdatingPicture ? 'Updating...' : 'Change Picture'}
          </button>
        </div>

        <div className="profile-info">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={editedUser.username || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editedUser.email || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={editedUser.location || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Age:</label>
                <input
                  type="number"
                  name="age"
                  value={editedUser.age || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Bio:</label>
                <textarea
                  name="bio"
                  value={editedUser.bio || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h2>{user?.username}</h2>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              {user?.location && <p><strong>Location:</strong> {user.location}</p>}
              {user?.age && <p><strong>Age:</strong> {user.age}</p>}
              {user?.bio && <p><strong>Bio:</strong> {user.bio}</p>}
              <button onClick={handleEdit} className="edit-profile-btn">Edit Profile</button>
            </>
          )}
        </div>
      </div>

      {isLoadingCourses ? (
        <div className="courses-section">
          <p>Loading courses...</p>
        </div>
      ) : (
        <>
          {user.role === 'instructor' && (
            <div className="courses-section">
              <h3>Created Courses</h3>
              {createdCourses.length > 0 ? (
                <div className="courses-grid">
                  {createdCourses.map(course => (
                    <div key={course._id} className="course-card">
                      <h4>{course.title}</h4>
                      <p>{course.description}</p>
                      <p>Students: {course.students?.length || 0}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No courses created yet.</p>
              )}
            </div>
          )}

          <div className="courses-section">
            <h3>Enrolled Courses</h3>
            {enrolledCourses.length > 0 ? (
              <div className="courses-grid">
                {enrolledCourses.map(course => (
                  <div key={course._id} className="course-card">
                    <h4>{course.title}</h4>
                    <p>{course.description}</p>
                    <p>Instructor: {course.instructor?.username}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No enrolled courses.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
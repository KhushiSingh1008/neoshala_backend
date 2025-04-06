import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadProfilePicture } from '../services/api';
import { toast } from 'react-toastify';
import { Course, User, ProfileUpdateData } from '../types';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaEdit, FaCamera, FaBook, FaGraduationCap, FaFileAlt } from 'react-icons/fa';
import './ProfilePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfilePage: React.FC = () => {
  const { user, token, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({
    username: '',
    email: '',
    location: '',
    age: undefined,
    bio: '',
    emailNotifications: true
  });
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'profile' | 'courses'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setEditedUser({
        username: user.username || '',
        email: user.email || '',
        location: user.location || '',
        age: user.age,
        bio: user.bio || '',
        emailNotifications: user.emailNotifications || true
      });

      // Set profile picture URL
      if (user.profilePicture) {
        const fullUrl = user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : `${API_URL}${user.profilePicture}`;
        setProfilePictureUrl(fullUrl);
      } else {
        setProfilePictureUrl('/default-profile.png');
      }
    }
  }, [user]);  // Only depend on user changes

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
    if (user) {
      setEditedUser({
        username: user.username || '',
        email: user.email || '',
        location: user.location || '',
        age: user.age,
        bio: user.bio || '',
        emailNotifications: user.emailNotifications || true
      });
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleCancel = () => {
    if (user) {
      setEditedUser({
        username: user.username || '',
        email: user.email || '',
        location: user.location || '',
        age: user.age,
        bio: user.bio || '',
        emailNotifications: user.emailNotifications || true
      });
    }
    setIsEditing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !token) return;

    const file = e.target.files[0];
    try {
      setIsUpdatingPicture(true);
      const response = await uploadProfilePicture(token, file);
      
      if (response && response.user) {
        // Update profile picture URL
        if (response.user.profilePicture) {
          const fullUrl = response.user.profilePicture.startsWith('http') 
            ? response.user.profilePicture 
            : `${API_URL}${response.user.profilePicture}`;
          setProfilePictureUrl(fullUrl);
          
          // Update user data with the full URL
          if (updateUserData) {
            updateUserData({
              ...response.user,
              profilePicture: fullUrl
            });
          }
        }
        
        toast.success('Profile picture updated successfully');
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile picture');
    } finally {
      setIsUpdatingPicture(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      const updatedFields = Object.entries(editedUser).reduce<Partial<User>>((acc, [key, value]) => {
        if (value !== undefined && value !== '' && value !== (user?.[key as keyof User] || '')) {
          acc[key as keyof User] = value as any;
        }
        return acc;
      }, {});

      if (Object.keys(updatedFields).length === 0) {
        toast.info('No changes to save');
        setIsEditing(false);
        return;
      }

      const updatedUser = await updateProfile(token, updatedFields as ProfileUpdateData);
      
      if (updateUserData && updatedUser) {
        updateUserData(updatedUser);
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCourseClick = (courseId: string) => {
    window.location.href = `/course/${courseId}`;
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!token) {
      toast.error('You must be logged in to remove a course');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove course from local state
        setCreatedCourses(prev => prev.filter(course => course._id !== courseId));
        toast.success('Course removed successfully');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove course');
      }
    } catch (error) {
      console.error('Error removing course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove course');
    }
  };

  const renderProfileContent = () => {
    if (!user) return null;

    if (isEditing) {
      return (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label><FaUser /> Username</label>
            <input
              type="text"
              name="username"
              value={editedUser.username ?? ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label><FaEnvelope /> Email</label>
            <input
              type="email"
              name="email"
              value={editedUser.email ?? ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label><FaMapMarkerAlt /> Location</label>
            <input
              type="text"
              name="location"
              value={editedUser.location ?? ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label><FaBirthdayCake /> Age</label>
            <input
              type="number"
              name="age"
              value={editedUser.age ?? ''}
              onChange={handleInputChange}
              min="0"
            />
          </div>
          <div className="form-group">
            <label><FaFileAlt /> Bio</label>
            <textarea
              name="bio"
              value={editedUser.bio ?? ''}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={editedUser.emailNotifications ?? true}
                onChange={(e) => setEditedUser(prev => ({
                  ...prev,
                  emailNotifications: e.target.checked
                }))}
              />
              Receive email notifications
            </label>
          </div>
          <div className="button-group">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      );
    }

    return (
      <div className="profile-info-display">
        <div className="info-item">
          <FaUser />
          <span className="info-label">Username:</span>
          <span className="info-value">{user?.username}</span>
        </div>
        <div className="info-item">
          <FaEnvelope />
          <span className="info-label">Email:</span>
          <span className="info-value">{user?.email}</span>
        </div>
        {user?.location && (
          <div className="info-item">
            <FaMapMarkerAlt />
            <span className="info-label">Location:</span>
            <span className="info-value">{user.location}</span>
          </div>
        )}
        {user?.age && (
          <div className="info-item">
            <FaBirthdayCake />
            <span className="info-label">Age:</span>
            <span className="info-value">{user.age}</span>
          </div>
        )}
        {user?.bio && (
          <div className="info-item">
            <FaFileAlt />
            <span className="info-label">Bio:</span>
            <span className="info-value">{user.bio}</span>
          </div>
        )}
        <div className="info-item">
          <span className="info-label">Email Notifications:</span>
          <span className="info-value">
            {user.emailNotifications ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <button onClick={handleEdit} className="edit-profile-btn">
          <FaEdit /> Edit Profile
        </button>
      </div>
    );
  };

  const renderCoursesContent = () => {
    if (!user) return null;

    if (isLoadingCourses) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      );
    }

    return (
      <div className="courses-section">
        {user?.role === 'instructor' ? (
          <div className="created-courses">
            <div className="courses-header">
              <h2><FaBook /> Created Courses</h2>
              <button 
                className="add-course-btn"
                onClick={() => window.location.href = '/add-course'}
              >
                Add New Course
              </button>
            </div>
            {createdCourses.length > 0 ? (
              <div className="courses-grid">
                {createdCourses.map(course => (
                  <div key={course._id} className="course-card">
                    <div 
                      className="course-card-content" 
                      onClick={() => handleCourseClick(course._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={course.imageUrl?.startsWith('http') ? course.imageUrl : `${API_URL}${course.imageUrl}` || 'https://via.placeholder.com/300x160'}
                        alt={course.title}
                        className="course-image"
                      />
                      <div className="course-content">
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                        <div className="course-meta">
                          <span>₹{course.price}</span>
                          <span>{course.students?.length || 0} students</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="remove-course-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to remove this course?')) {
                          handleRemoveCourse(course._id);
                        }
                      }}
                    >
                      Remove Course
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-courses">No courses created yet</p>
            )}
          </div>
        ) : (
          <div className="enrolled-courses">
            <h2><FaGraduationCap /> Enrolled Courses</h2>
            {enrolledCourses.length > 0 ? (
              <div className="courses-grid">
                {enrolledCourses.map(course => (
                  <div 
                    key={course._id} 
                    className="course-card"
                    onClick={() => handleCourseClick(course._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={course.imageUrl?.startsWith('http') ? course.imageUrl : `${API_URL}${course.imageUrl}` || 'https://via.placeholder.com/300x160'}
                      alt={course.title}
                      className="course-image"
                    />
                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <div className="course-meta">
                        <span>₹{course.price}</span>
                        <span>By {course.instructor?.username}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-courses">No enrolled courses yet</p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-picture-container">
          <img 
            src={profilePictureUrl || '/default-profile.png'} 
            alt="Profile" 
            className="profile-picture"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/default-profile.png';
            }}
          />
          <label className="profile-picture-upload" htmlFor="profile-picture">
            <FaCamera />
            <input
              type="file"
              id="profile-picture"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
              disabled={isUpdatingPicture}
            />
          </label>
          {isUpdatingPicture && <div className="upload-overlay">Uploading...</div>}
        </div>
        <h2>{user?.username || 'User Profile'}</h2>
        <p className="user-role">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ''}</p>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <FaBook /> Courses
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' ? renderProfileContent() : renderCoursesContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
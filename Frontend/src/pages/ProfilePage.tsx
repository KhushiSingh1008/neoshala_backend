import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadProfilePicture, updateEmailNotifications } from '../services/api';
import { toast } from 'react-toastify';
import { Course, User, ProfileUpdateData } from '../types';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaEdit, FaCamera, FaBook, FaGraduationCap, FaFileAlt } from 'react-icons/fa';
import styled from 'styled-components';
import './ProfilePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

const EmailNotificationSection = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  border: 1px solid #eaeaea;
`;

const NotificationHeading = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

interface SwitchProps {
  $isActive: boolean;
}

const Switch = styled.div<SwitchProps>`
  position: relative;
  width: 60px;
  height: 30px;
  background-color: ${props => props.$isActive ? '#4a154b' : '#ccc'};
  border-radius: 30px;
  padding: 4px;
  transition: all 0.3s;
  cursor: pointer;
  
  &:after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: white;
    top: 4px;
    left: ${props => props.$isActive ? '34px' : '4px'};
    transition: all 0.3s;
  }
`;

const Label = styled.span`
  margin-left: 10px;
  font-size: 16px;
  color: #666;
`;

const ProfilePage = () => {
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
      console.log('Initializing user data from context:', user);
      
      // Default emailNotifications to true if undefined
      const emailNotificationsValue = user.emailNotifications === false ? false : true;
      
      setEditedUser({
        username: user.username || '',
        email: user.email || '',
        location: user.location || '',
        age: user.age,
        bio: user.bio || '',
        emailNotifications: emailNotificationsValue
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
          const createdResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/instructor/${user._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (createdResponse.ok) {
            const createdData = await createdResponse.json();
            setCreatedCourses(createdData);
            console.log('Fetched created courses:', createdData);
          } else {
            console.error('Failed to fetch created courses');
          }
        }
        
        // Fetch enrolled courses for all users
        const enrolledResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/student/${user._id}`, {
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
        toast.error('Failed to fetch your courses. Please try again later.');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [user?._id, user?.role, token]);

  const handleEdit = () => {
    if (user) {
      // Default emailNotifications to true if undefined, but respect the current value if set
      const emailNotificationsValue = user.emailNotifications === false ? false : true;
      
      setEditedUser({
        username: user.username || '',
        email: user.email || '',
        location: user.location || '',
        age: user.age,
        bio: user.bio || '',
        emailNotifications: emailNotificationsValue
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
      // Default emailNotifications to true if undefined, but respect the current value if set
      const emailNotificationsValue = user.emailNotifications === false ? false : true;
      
      setEditedUser({
        username: user.username || '',
        email: user.email || '',
        location: user.location || '',
        age: user.age,
        bio: user.bio || '',
        emailNotifications: emailNotificationsValue
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
      // Prepare data for update - only including fields that can be updated according to the ProfileUpdateData interface
      const profileData: ProfileUpdateData = {
        location: editedUser.location,
        age: editedUser.age,
        bio: editedUser.bio,
        emailNotifications: editedUser.emailNotifications
      };

      console.log('Updating profile with data:', profileData);
      
      // Call the API
      const updatedUser = await updateProfile(token, profileData);
      
      // Update the user context
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove course from local state
        setCreatedCourses(prev => prev.filter(course => course._id !== courseId));
        toast.success('Course removed successfully');
      } else {
        const error = await response.json();
        
        // Handle specific error cases
        if (response.status === 401) {
          toast.error('Authentication required. Please log in again.');
          // Could redirect to login here
        } else if (response.status === 403) {
          toast.error('You do not have permission to delete this course.');
        } else if (response.status === 404) {
          toast.error('Course not found. It may have been already deleted.');
          // Remove from local state since it doesn't exist anymore
          setCreatedCourses(prev => prev.filter(course => course._id !== courseId));
        } else {
          throw new Error(error.message || 'Failed to remove course');
        }
      }
    } catch (error) {
      console.error('Error removing course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove course');
    }
  };

  const handleToggleEmailNotifications = async () => {
    if (!token || !user) return;
    
    try {
      // Get current status from user object
      const currentStatus = user.emailNotifications === true;
      // Toggle to opposite value
      const newStatus = !currentStatus;
      
      console.log('Toggling email notifications from', currentStatus, 'to', newStatus);
      
      // Make API call with clear boolean value
      const result = await updateEmailNotifications(token, newStatus);
      
      // Update user context with new value from server response
      if (updateUserData) {
        updateUserData({
          ...user,
          emailNotifications: result.emailNotifications
        });
      }
      
      toast.success(result.message);
    } catch (error) {
      console.error('Error updating email notifications:', error);
      toast.error('Failed to update email notification settings');
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
                checked={editedUser.emailNotifications === true}
                onChange={(e) => {
                  console.log('Checkbox changed to:', e.target.checked);
                  setEditedUser(prev => ({
                    ...prev,
                    emailNotifications: e.target.checked
                  }));
                }}
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
        <EmailNotificationSection>
          <NotificationHeading>
            Email Notifications:
          </NotificationHeading>
          <p style={{ margin: '5px 0', color: '#666' }}>
            {user?.emailNotifications === true 
              ? 'Enabled - You will receive email notifications for course purchases and updates.' 
              : 'Disabled - You will not receive email notifications.'}
          </p>
          <ToggleContainer onClick={handleToggleEmailNotifications}>
            <Switch $isActive={user?.emailNotifications === true} />
            <Label>
              {user?.emailNotifications === true ? 'Enabled' : 'Disabled'}
            </Label>
          </ToggleContainer>
        </EmailNotificationSection>
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
                onClick={() => window.location.href = '/added-courses'}
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
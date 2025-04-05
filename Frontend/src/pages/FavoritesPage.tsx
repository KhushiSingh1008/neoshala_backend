import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import { FaStar, FaMapMarkerAlt, FaClock, FaHeart } from 'react-icons/fa';
import { MdCategory } from 'react-icons/md';
import { toast } from 'react-toastify';
import './MyCoursesU.css';  // We'll reuse the same styles

const FavoritesPage = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteCourses();
  }, [user?._id, token]);

  const fetchFavoriteCourses = async () => {
    if (!user?._id || !token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorite courses');
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching favorite courses:', error);
      toast.error('Failed to load favorite courses');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (courseId: string) => {
    if (!user?._id || !token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/favorites/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      setCourses(courses.filter(course => course._id !== courseId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your favorite courses...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="no-courses">
        <h2>No Favorite Courses</h2>
        <p>Browse our courses and add some to your favorites!</p>
        <a href="/explore" className="browse-btn">Browse Courses</a>
      </div>
    );
  }

  return (
    <div className="my-courses-page">
      <h1>My Favorite Courses</h1>
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className="course-card">
            <div className="course-image-container" onClick={() => window.location.href = `/course/${course._id}`}>
              <img
                src={course.imageUrl?.startsWith('http') ? course.imageUrl : `http://localhost:5000${course.imageUrl}` || 'https://via.placeholder.com/300x200'}
                alt={course.title}
                className="course-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/300x200';
                }}
              />
              <button 
                className="favorite-btn active"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(course._id);
                }}
              >
                <FaHeart />
              </button>
            </div>
            <div className="course-content">
              <h2 onClick={() => window.location.href = `/course/${course._id}`}>{course.title}</h2>
              <p className="instructor">By {course.instructor?.username}</p>
              
              <div className="course-details">
                <div className="detail-item">
                  <FaMapMarkerAlt className="detail-icon" />
                  <span>{course.location || 'Online'}</span>
                </div>
                <div className="detail-item">
                  <FaStar className="detail-icon" />
                  <span>{course.rating ? `${course.rating.toFixed(1)}/5` : 'Not rated'}</span>
                </div>
                <div className="detail-item">
                  <MdCategory className="detail-icon" />
                  <span>{course.category}</span>
                </div>
                <div className="detail-item">
                  <FaClock className="detail-icon" />
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage; 
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import { FaStar, FaMapMarkerAlt, FaClock, FaHeart } from 'react-icons/fa';
import { MdCategory } from 'react-icons/md';
import { toast } from 'react-toastify';
import './MyCoursesU.css';

interface RatingProps {
  rating: number;
  onRatingChange: (newRating: number) => void;
  readonly?: boolean;
}

const StarRating: React.FC<RatingProps> = ({ rating, onRatingChange, readonly = false }) => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`star ${star <= (hover || rating) ? 'active' : 'inactive'} ${readonly ? 'readonly' : ''}`}
          onClick={() => !readonly && onRatingChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(null)}
        />
      ))}
    </div>
  );
};

const MyCoursesU = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchMyCourses();
    fetchFavorites();
  }, [user?._id, token]);

  const fetchFavorites = async () => {
    if (!user?._id || !token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data.map((fav: { courseId: string }) => fav.courseId));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (courseId: string) => {
    if (!user?._id || !token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/favorites/${courseId}`, {
        method: favorites.includes(courseId) ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      if (favorites.includes(courseId)) {
        setFavorites(favorites.filter(id => id !== courseId));
        toast.success('Removed from favorites');
      } else {
        setFavorites([...favorites, courseId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const fetchUserRating = async (courseId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/rating/${user?._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch rating');
      const data = await response.json();
      return data.rating;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return 0;
    }
  };

  const fetchMyCourses = async () => {
    if (!user?._id || !token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/courses/student/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      
      // Fetch user ratings for each course
      const coursesWithRatings = await Promise.all(
        data.map(async (course: Course) => {
          const userRating = await fetchUserRating(course._id);
          return { ...course, userRating };
        })
      );

      setCourses(coursesWithRatings);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (courseId: string, newRating: number) => {
    if (!user?._id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          rating: newRating,
          userId: user._id 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const updatedCourse = await response.json();
      
      // Update the courses state with the new rating
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course._id === courseId 
            ? { ...course, rating: updatedCourse.rating, userRating: updatedCourse.userRating }
            : course
        )
      );
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your courses...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="no-courses">
        <h2>You haven't enrolled in any courses yet</h2>
        <p>Browse our courses and start learning today!</p>
        <a href="/explore" className="browse-btn">Browse Courses</a>
      </div>
    );
  }

  return (
    <div className="my-courses-page">
      <h1>My Courses</h1>
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
                className={`favorite-btn ${favorites.includes(course._id) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(course._id);
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

              <div className="rating-section">
                <p className="rating-label">Rate this course:</p>
                <StarRating
                  rating={course.userRating || 0}
                  onRatingChange={(newRating) => handleRating(course._id, newRating)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCoursesU;

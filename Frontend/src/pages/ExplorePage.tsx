import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getAllCourses } from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { Course } from '../types';
import { FaStar, FaMapMarkerAlt, FaClock, FaHeart, FaSearch, FaFilter } from 'react-icons/fa';
import { MdCategory } from 'react-icons/md';
import './ExplorePage.css';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Filters {
  location: string;
  minPrice: string;
  maxPrice: string;
  category: string;
  level: string;
}

const ExplorePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    location: '',
    minPrice: '',
    maxPrice: '',
    category: '',
    level: ''
  });
  const { user, token } = useAuth();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  // Redirect instructors to home page
  if (user?.role === 'instructor') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?._id || !token) return;

      try {
        const response = await fetch(`${API_URL}/api/users/${user._id}/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }

        const data = await response.json();
        setFavorites(data.map((fav: Course) => fav._id));
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user, token]);

  // Apply search and filters
  useEffect(() => {
    let result = [...courses];

    // Apply search
    if (searchTerm) {
      result = result.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.location) {
      result = result.filter(course => 
        course.location.toLowerCase() === filters.location.toLowerCase()
      );
    }

    if (filters.minPrice) {
      result = result.filter(course => 
        course.price >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      result = result.filter(course => 
        course.price <= parseFloat(filters.maxPrice)
      );
    }

    if (filters.category) {
      result = result.filter(course => 
        course.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.level) {
      result = result.filter(course => 
        course.level.toLowerCase() === filters.level.toLowerCase()
      );
    }

    setFilteredCourses(result);
  }, [searchTerm, filters, courses]);

  const toggleFavorite = async (courseId: string) => {
    if (!user?._id || !token) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${user._id}/favorites/${courseId}`, {
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      category: '',
      level: ''
    });
    setSearchTerm('');
  };

  // Get unique values for filters
  const handleCardClick = (id: string) => {
    navigate(`/course/${id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    if (isInCart(course._id)) {
      toast.info('Course is already in your cart');
      return;
    }
    addToCart(course);
    toast.success('Course added to cart');
  };

  const locations = Array.from(new Set(courses.map(course => course.location)));
  const categories = Array.from(new Set(courses.map(course => course.category)));
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="explore-page">
      <div className="search-section">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="filters-container">
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <div className="price-range">
              <input
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>

            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <h1>Explore Courses</h1>
      
      {filteredCourses.length === 0 ? (
        <div className="no-results">
          <h2>No courses found</h2>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-image-container" onClick={() => navigate(`/course/${course._id}`)}>
                <img
                  src={course.imageUrl?.startsWith('http') ? course.imageUrl : `${API_URL}${course.imageUrl}` || 'https://via.placeholder.com/300x200'}
                  alt={course.title}
                  className="course-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x200';
                  }}
                />
                {user?.role === 'student' && (
                  <button 
                    className={`favorite-btn ${favorites.includes(course._id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(course._id);
                    }}
                  >
                    <FaHeart />
                  </button>
                )}
              </div>
              <div className="course-content">
                <h2 onClick={() => navigate(`/course/${course._id}`)}>{course.title}</h2>
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
                <div className="course-price">₹{course.price}</div>
                {user?.role === 'student' && (
                  <div className="card-actions">
                    <button 
                      className="add-to-cart-button"
                      onClick={(e) => handleAddToCart(e, course)}
                    >
                      {isInCart(course._id) ? 'In Cart' : 'Add to Cart'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
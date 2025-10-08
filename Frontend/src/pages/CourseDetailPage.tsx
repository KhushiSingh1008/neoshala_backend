import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById } from '../services/api';
import { checkEnrollmentStatus } from '../services/enrollmentService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { Course } from '../types';
import ChatRoom from '../components/ChatRoom';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        const data = await getCourseById(courseId);
        setCourse(data);
        
        // Check enrollment status if user is logged in
        if (user && token) {
          const enrollmentStatus = await checkEnrollmentStatus(courseId, token);
          setIsEnrolled(enrollmentStatus);
          
          // Auto-open chat if URL has #chat hash
          if (window.location.hash === '#chat' && enrollmentStatus) {
            setShowChat(true);
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Failed to fetch course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user, token]);

  const handleAddToCart = () => {
    if (!course) return;
    
    if (isInCart(course._id)) {
      toast.info('Course is already in your cart');
      return;
    }

    addToCart(course);
    toast.success('Course added to cart successfully!');
  };

  const handleBuyNow = () => {
    if (!course) return;
    
    if (!isInCart(course._id)) {
      addToCart(course);
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail">
        <h1>Course not found</h1>
      </div>
    );
  }

  return (
    <div className="course-detail">
      <div className="course-header">
        <img
          src={
            course.imageUrl 
              ? (course.imageUrl.startsWith('http') 
                ? course.imageUrl 
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${course.imageUrl}`)
              : 'https://via.placeholder.com/600x450'
          }
          alt={course.title}
          className="course-detail-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/600x450';
          }}
        />
        <div className="course-info">
          <h1>{course.title}</h1>
          <p className="instructor">Trainer: {course.instructor?.username}</p>
          <div className="meta-info">
            <div className="meta-item">
              <span className="label">Rating:</span>
              <span className="value">{course.rating || 0}/5</span>
            </div>
            <div className="meta-item">
              <span className="label">Duration:</span>
              <span className="value">{course.duration}</span>
            </div>
            <div className="meta-item">
              <span className="label">Level:</span>
              <span className="value">{course.level}</span>
            </div>
            <div className="meta-item">
              <span className="label">Location:</span>
              <span className="value">{course.location}</span>
            </div>
            <div className="meta-item">
              <span className="label">Category:</span>
              <span className="value">{course.category}</span>
            </div>
          </div>
          <div className="price-section">
            <p className="price">₹{course.price}</p>
            
            {/* Show enrollment status for logged in users */}
            {user && isEnrolled && (
              <div className="enrollment-status">
                <span className="enrolled-badge">✅ You are enrolled in this course</span>
              </div>
            )}
            
            {user?.role === 'student' ? (
              isEnrolled ? (
                <div className="enrolled-actions">
                  <p className="enrolled-message">You have access to this course!</p>
                  <button 
                    onClick={() => setShowChat(!showChat)}
                    className="chat-toggle-button"
                  >
                    {showChat ? '💬 Hide Chat' : '💬 Chat with Instructor & Students'}
                  </button>
                </div>
              ) : (
                <div className="action-buttons">
                  <button onClick={handleAddToCart} className="cart-button">
                    Add to Cart
                  </button>
                  <button onClick={handleBuyNow} className="buy-button">
                    Buy Now
                  </button>
                </div>
              )
            ) : user?.role === 'instructor' ? (
              course.instructor?.username === user.username ? (
                <div className="instructor-own-course">
                  <p className="instructor-message">This is your course</p>
                  <button 
                    onClick={() => setShowChat(!showChat)}
                    className="chat-toggle-button"
                  >
                    {showChat ? '💬 Hide Chat' : '💬 Chat with Students'}
                  </button>
                </div>
              ) : (
                <p className="instructor-message">Instructors cannot enroll in other courses</p>
              )
            ) : (
              <Link to="/AuthPage" className="login-to-enroll">
                Login as student to enroll
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="course-content">
        <div className="description">
          <h2>Detailed Description</h2>
          <p>{course.detailedDescription}</p>
        </div>

        <div className="details-grid">
          <div className="syllabus">
            <h2>Syllabus</h2>
            <ul>
              {course.syllabus?.map((item, index) => (
                <li key={index}>{item}</li>
              )) || []}
            </ul>
          </div>

          <div className="requirements">
            <h2>Requirements</h2>
            <ul>
              {course.requirements?.map((item, index) => (
                <li key={index}>{item}</li>
              )) || []}
            </ul>
          </div>
        </div>
      </div>

      {/* Chat Room Section */}
      {showChat && user && isEnrolled && courseId && (
        <div className="chat-room-section mt-8">
          <ChatRoom courseId={courseId} courseTitle={course.title} />
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
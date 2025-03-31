import React, { useState, useEffect } from 'react';
import './Reviews.css';

interface Review {
  id: number;
  imageUrl: string;
  text: string;
  author: string;
  role: string;
}

const sampleReviews: Review[] = [
  {
    id: 1,
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'Excellent service! The team went above and beyond to meet our needs. Highly recommended for anyone looking for quality work.',
    author: 'Sarah Johnson',
    role: 'Marketing Director'
  },
  {
    id: 2,
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'Working with this company was a game-changer for our business. Their attention to detail and creative solutions are unmatched.',
    author: 'Michael Chen',
    role: 'CEO, TechStart'
  },
  {
    id: 3,
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    text: 'The results exceeded our expectations. Professional, efficient, and delivered on time. Will definitely work with them again.',
    author: 'Emily Rodriguez',
    role: 'Product Manager'
  },
  {
    id: 4,
    imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    text: 'Outstanding communication throughout the project. They understood our vision perfectly and brought it to life beautifully.',
    author: 'David Wilson',
    role: 'Creative Director'
  },
  {
    id: 5,
    imageUrl: 'https://randomuser.me/api/portraits/women/23.jpg',
    text: 'A pleasure to work with from start to finish. Their expertise saved us time and money while delivering top-notch results.',
    author: 'Jessica Lee',
    role: 'Founder & CEO'
  }
];

const Reviews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transition, setTransition] = useState(true);

  useEffect(() => {
    if (!transition) {
      const timer = setTimeout(() => setTransition(true), 50);
      return () => clearTimeout(timer);
    }
  }, [transition]);

  const nextSlide = () => {
    if (transition) {
      setTransition(false);
      setCurrentIndex((prevIndex) => 
        prevIndex === sampleReviews.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevSlide = () => {
    if (transition) {
      setTransition(false);
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? sampleReviews.length - 1 : prevIndex - 1
      );
    }
  };

  const getVisibleReviews = () => {
    const visibleReviews = [];
    const totalReviews = sampleReviews.length;

    const prevIndex = (currentIndex - 1 + totalReviews) % totalReviews;
    visibleReviews.push(sampleReviews[prevIndex]);

    visibleReviews.push(sampleReviews[currentIndex]);

    const nextIndex = (currentIndex + 1) % totalReviews;
    visibleReviews.push(sampleReviews[nextIndex]);

    return visibleReviews;
  };

  return (
    <div id="reviews" className="review-carousel-container">
      <div className={`reviews-wrapper ${transition ? 'transition' : ''}`}>
        <button 
          className="carousel-button left" 
          onClick={prevSlide} 
          aria-label="Previous review"
        >
          &lt;
        </button>
        
        {getVisibleReviews().map((review, index) => (
          <div 
            key={`${review.id}-${index}`}
            className={`review-card ${index === 1 ? 'center' : 'side'}`}
          >
            <div className="review-image-container">
              <img 
                src={review.imageUrl} 
                alt={`${review.author}`} 
                className="review-image"
              />
            </div>
            <div className="review-content">
              <p className="review-text">"{review.text}"</p>
              <div className="review-author">
                <strong>{review.author}</strong>
                <span>{review.role}</span>
              </div>
            </div>
          </div>
        ))}
        
        <button 
          className="carousel-button right" 
          onClick={nextSlide} 
          aria-label="Next review"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Reviews;
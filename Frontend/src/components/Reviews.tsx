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
    imageUrl: './assets/Rakshit.png',
    text: 'I’ve been using Neoshala for a few months now, and it has completely transformed my routine. The quality is outstanding, and the results speak for themselves. Highly recommend!',
    author: 'Rakshit Sharma',
    role: 'Web Developer'
  },
  {
    id: 2,
    imageUrl: './assets/Anshi.png',
    text: 'Finding the right learning platform used to be a nightmare. With Neoshala, I discovered so many amazing non-coaching options I didn’t even know existed!',
    author: 'Anshi Tiwari',
    role: 'Third Year Student'
  },
  {
    id: 3,
    imageUrl: './assets/pratham.png',
    text: 'I love that Neoshala is unbiased It is not pushing any one coaching center—just showing genuine options for learners.',
    author: 'Pratham',
    role: 'Third Year Student'
  },
  {
    id: 4,
    imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    text: 'I can find the students online easily and spread my knowledge easily to thoses who need it.',
    author: 'David Wilson',
    role: 'Yoga Trainer'
  },
  {
    id: 5,
    imageUrl: 'https://randomuser.me/api/portraits/women/23.jpg',
    text: 'A pleasure to work with from start to finish. Their expertise saved us time and money while delivering top-notch results.',
    author: 'Jessica Lee',
    role: 'Pottery Trainer'
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
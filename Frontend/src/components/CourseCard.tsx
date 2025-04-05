import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';
import reactLogo from '../assets/react-logo.svg';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  location: string;
  description: string;
  duration: string;
  price: number;
  rating: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  location,
  description,
  duration,
  price,
  rating
}) => {
  return (
    <div className="course-card">
      <div className="course-image">
        <img src={reactLogo} alt={title} />
      </div>
      <div className="course-content">
        <h3 className="course-title">{title}</h3>
        <p className="course-instructor">By {instructor}</p>
        <p className="course-location">{location}</p>
        <p className="course-description">{description}</p>
        <div className="course-meta">
          <span className="course-duration">{duration}</span>
          <div className="course-price">
            <span className="course-rating">⭐ {rating.toFixed(1)}</span>
            ₹{price.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
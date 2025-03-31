import React from 'react';
import { Course } from '../Types/Course';
import './CourseCard.css';

interface CourseCardProps {
  course: Course;
  onClick: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div className="course-card" onClick={() => onClick(course.id)}>
      <div className="course-image-container">
        <img src={course.imageUrl} alt={course.title} className="course-image" />
        <span className="course-level">{course.level}</span>
      </div>
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">By {course.instructor}</p>
        <p className="course-location">{course.location}</p>
        <p className="course-description">{course.description}</p>
        <div className="course-meta">
          <span className="course-duration">{course.duration}</span>
          <span className="course-rating">⭐ {course.rating}</span>
          <span className="course-price">₹{course.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
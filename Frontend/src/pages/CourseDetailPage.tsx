import React from 'react';
import { useParams } from 'react-router-dom';
import { courses } from '../Data/Courses';
import './CourseDetailPage.css';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="course-detail">
      <div className="course-header">
        <img src={course.imageUrl} alt={course.title} className="course-detail-image" />
        <div className="course-info">
          <h1>{course.title}</h1>
          <p className="instructor">By {course.instructor}</p>
          <div className="meta">
            <span className="level">{course.level}</span>
            <span className="duration">{course.duration}</span>
            <span className="rating">⭐ {course.rating}</span>
          </div>
          <div className="price">₹{course.price.toFixed(2)}</div>
          <button className="enroll-button">Enroll Now</button>
        </div>
      </div>
      
      <div className="course-content">
        <section className="description">
          <h2>Description</h2>
          <p>{course.detailedDescription}</p>
        </section>
        
        <div className="details-grid">
          <section className="syllabus">
            <h2>Syllabus</h2>
            <ul>
              {course.syllabus?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
          
          <section className="requirements">
            <h2>Requirements</h2>
            <ul>
              {course.requirements?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { courses } from '../Data/Courses';
import './ExplorePage.css';

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="explore-page">
      <h1 className="page-title">Explore Courses</h1>
      <div className="courses-grid">
        {courses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onClick={handleCourseClick} 
          />
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
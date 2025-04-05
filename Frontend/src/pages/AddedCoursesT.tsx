import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createCourse, getCourses } from '../services/api';
import { toast } from 'react-toastify';
import { Course, CourseFormData } from '../types';
import './AddedCoursesT.css';
import { useNavigate } from 'react-router-dom';

const AddedCoursesT = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    location: '',
    duration: '',
    level: 'Beginner',
    imageUrl: '',
    price: 0,
    category: '',
    detailedDescription: '',
    syllabus: [''],
    requirements: [''],
    instructor: user?._id || ''
  });
  const [error, setError] = useState<string | null>(null);

  const [syllabusItems, setSyllabusItems] = useState<string[]>(['']);
  const [requirementItems, setRequirementItems] = useState<string[]>(['']);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user || !token) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getCourses();
        const instructorCourses = data.filter((course: Course) => course.instructor._id === user._id);
        setCourses(instructorCourses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
        toast.error(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSyllabusChange = (index: number, value: string) => {
    const newItems = [...syllabusItems];
    newItems[index] = value;
    setSyllabusItems(newItems);
    setFormData(prev => ({ ...prev, syllabus: newItems.filter(item => item.trim() !== '') }));
  };

  const addSyllabusItem = () => {
    setSyllabusItems([...syllabusItems, '']);
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newItems = [...requirementItems];
    newItems[index] = value;
    setRequirementItems(newItems);
    setFormData(prev => ({ ...prev, requirements: newItems.filter(item => item.trim() !== '') }));
  };

  const addRequirementItem = () => {
    setRequirementItems([...requirementItems, '']);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      const courseData = {
        ...formData,
        imageUrl,
        syllabus: syllabusItems.filter(item => item.trim() !== ''),
        requirements: requirementItems.filter(item => item.trim() !== ''),
      };

      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      const data = await response.json();
      navigate(`/course/${data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'instructor') {
    return <div className="access-denied">Access denied. This page is for instructors only.</div>;
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="page-header">
        <h1 className="page-title">My Courses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-course-btn"
        >
          {showForm ? 'Cancel' : 'Add New Course'}
        </button>
      </div>

      {showForm && (
        <div className="course-form">
          <h2 className="form-title">Create New Course</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="e.g., Online or Physical Location"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Short Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="form-textarea"
                placeholder="Brief overview of the course"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea
                name="detailedDescription"
                value={formData.detailedDescription}
                onChange={handleChange}
                required
                rows={6}
                className="form-textarea"
                placeholder="Comprehensive description of what students will learn"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="e.g., 8 weeks, 3 months"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Course Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select a category</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="music">Music</option>
                <option value="photography">Photography</option>
                <option value="health">Health & Fitness</option>
                <option value="language">Language</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Syllabus</label>
              {syllabusItems.map((item, index) => (
                <div key={index} className="list-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleSyllabusChange(index, e.target.value)}
                    className="form-input"
                    placeholder={`Syllabus item ${index + 1}`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addSyllabusItem}
                className="add-item-btn"
              >
                Add Syllabus Item
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Requirements</label>
              {requirementItems.map((item, index) => (
                <div key={index} className="list-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    className="form-input"
                    placeholder={`Requirement ${index + 1}`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirementItem}
                className="add-item-btn"
              >
                Add Requirement
              </button>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className="course-card">
            <div className="course-image-container">
              <img
                src={course.imageUrl?.startsWith('http') ? course.imageUrl : `http://localhost:5000${course.imageUrl}` || 'https://via.placeholder.com/300x160'}
                alt={course.title}
                className="course-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/300x160';
                }}
              />
            </div>
            <div className="course-content">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span className="course-price">₹{course.price}</span>
                <span className="course-rating">
                  Rating: {course.rating || 0}/5
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddedCoursesT;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Course, CourseFormData } from '../types';
import './AddedCoursesT.css';
import { useNavigate } from 'react-router-dom';
import { getInstructorCourses } from '../services/courseService';

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
    if (user && token) {
      fetchCourses();
    }
  }, [user, token]);

  const fetchCourses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getInstructorCourses(user._id);
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

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

    // Validate required fields
    const requiredFields = [
      'title', 'location', 'description', 'duration', 
      'level', 'price', 'category', 'detailedDescription'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof CourseFormData]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Check if syllabus and requirements have at least one valid item
    if (syllabusItems.filter(item => item.trim() !== '').length === 0) {
      setError('Please add at least one syllabus item');
      setLoading(false);
      toast.error('Please add at least one syllabus item');
      return;
    }
    
    if (requirementItems.filter(item => item.trim() !== '').length === 0) {
      setError('Please add at least one requirement');
      setLoading(false);
      toast.error('Please add at least one requirement');
      return;
    }

    try {
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        console.log('Uploading image...');
        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
        console.log('Image uploaded successfully:', imageUrl);
      } else {
        setError('Please upload a course image');
        setLoading(false);
        toast.error('Course image is required');
        return;
      }

      // Prepare course data
      const courseData = {
        ...formData,
        imageUrl,
        syllabus: syllabusItems.filter(item => item.trim() !== ''),
        requirements: requirementItems.filter(item => item.trim() !== ''),
        instructor: user?._id,
        // Convert price to number
        price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price
      };

      console.log('Creating course with data:', courseData);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.errors) {
          // Format validation errors for display
          const errorMessages = Object.entries(responseData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          throw new Error(errorMessages || responseData.message || 'Failed to create course');
        } else {
          throw new Error(responseData.message || 'Failed to create course');
        }
      }

      toast.success('Course created successfully!');
      console.log('Course created:', responseData);
      
      // Reset form
      setFormData({
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
      setImageFile(null);
      setSyllabusItems(['']);
      setRequirementItems(['']);
      setShowForm(false);
      
      // Refresh courses
      fetchCourses();
      
      // Navigate to the course detail page
      navigate(`/course/${responseData._id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error creating course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!token) {
      toast.error('You must be logged in to delete a course');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state to remove the deleted course
        setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
        toast.success('Course deleted successfully');
        
        // Update the user's createdCourses in context if needed
        if (user && user.createdCourses) {
          user.createdCourses = user.createdCourses.filter((id: string) => id !== courseId);
        }
      } else {
        const errorData = await response.json();
        
        // Handle specific error cases
        if (response.status === 401) {
          toast.error('Authentication required. Please log in again.');
          // Could redirect to login here
        } else if (response.status === 403) {
          toast.error('You do not have permission to delete this course.');
        } else if (response.status === 404) {
          toast.error('Course not found. It may have been already deleted.');
          // Remove from local state since it doesn't exist anymore
          setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
        } else {
          throw new Error(errorData.message || 'Failed to delete course');
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred while deleting the course');
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
                src={
                  course.imageUrl 
                    ? (course.imageUrl.startsWith('http') 
                      ? course.imageUrl 
                      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${course.imageUrl}`)
                    : 'https://via.placeholder.com/300x160'
                }
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
              <div className="course-actions">
                <button 
                  className="view-btn"
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  View
                </button>
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(course._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddedCoursesT;

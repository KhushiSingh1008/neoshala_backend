import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter } from 'react-icons/fa';
import './AdminCourses.css';

interface Course {
  _id: string;
  title: string;
  instructor: {
    _id: string;
    username: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const AdminCourses: React.FC = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchCourses = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/admin/courses${statusFilter ? `?status=${statusFilter}` : ''}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        toast.error('Failed to load courses');
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token, statusFilter]);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="admin-courses">
      <div className="page-header">
        <h1>Courses</h1>
        <Link to="/admin/dashboard" className="back-link">Back to Dashboard</Link>
      </div>

      <div className="filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="status-filter">
          <FaFilter className="filter-icon" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="courses-table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Instructor</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <tr key={course._id}>
                  <td>{course.title}</td>
                  <td>{course.instructor.username}</td>
                  <td>
                    <span className={`status-badge ${course.approvalStatus}`}>
                      {course.approvalStatus.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/course/${course._id}`} className="view-btn">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="no-results">
                  No courses found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourses; 
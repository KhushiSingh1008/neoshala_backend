import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaSearch, FaEye } from 'react-icons/fa';
import './AdminPendingCourses.css';

interface CourseInstructor {
  _id: string;
  username: string;
  email: string;
}

interface PendingCourse {
  _id: string;
  title: string;
  description: string;
  instructor: CourseInstructor;
  category: string;
  price: number;
  duration: string;
  level: string;
  createdAt: string;
}

const AdminPendingCourses: React.FC = () => {
  const { user, token } = useAuth();
  const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchPendingCourses = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/admin/courses/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pending courses');
        }

        const data = await response.json();
        setPendingCourses(data);
      } catch (error) {
        toast.error('Failed to load pending courses');
        console.error('Error fetching pending courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCourses();
  }, [token]);

  const handleApprove = async (courseId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/courses/${courseId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve course');
      }

      const data = await response.json();
      toast.success(data.message || 'Course approved successfully');
      
      // Remove course from list
      setPendingCourses(prev => prev.filter(course => course._id !== courseId));
    } catch (error) {
      toast.error('Failed to approve course');
      console.error('Error approving course:', error);
    }
  };

  const handleReject = async (courseId: string) => {
    if (!token) return;

    // Prompt for rejection reason
    const reason = prompt('Please enter a reason for rejecting this course:');
    if (!reason) {
      toast.info('Rejection cancelled');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/courses/${courseId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject course');
      }

      const data = await response.json();
      toast.success(data.message || 'Course rejected successfully');
      
      // Remove course from list
      setPendingCourses(prev => prev.filter(course => course._id !== courseId));
    } catch (error) {
      toast.error('Failed to reject course');
      console.error('Error rejecting course:', error);
    }
  };

  const filteredCourses = pendingCourses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <FaSpinner className="loading-spinner" />
        <p>Loading pending courses...</p>
      </div>
    );
  }

  return (
    <div className="admin-pending-courses">
      <div className="page-header">
        <h1>Pending Courses</h1>
        <Link to="/admin/dashboard" className="back-link">Back to Dashboard</Link>
      </div>

      <div className="search-filter">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, instructor, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="no-courses">
          <p>No pending courses found</p>
        </div>
      ) : (
        <div className="courses-table-container">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Instructor</th>
                <th>Category</th>
                <th>Level</th>
                <th>Price</th>
                <th>Submitted On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course._id}>
                  <td>{course.title}</td>
                  <td>
                    <span className="instructor-name">{course.instructor.username}</span>
                    <br />
                    <span className="instructor-email">{course.instructor.email}</span>
                  </td>
                  <td>{course.category}</td>
                  <td>{course.level}</td>
                  <td>₹{course.price}</td>
                  <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <Link to={`/course/${course._id}`} className="view-btn" title="View Course">
                        <FaEye />
                      </Link>
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(course._id)}
                        title="Approve Course"
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(course._id)}
                        title="Reject Course"
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPendingCourses; 
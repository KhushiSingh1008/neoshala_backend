import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaUsers, FaBook, FaGraduationCap } from 'react-icons/fa';
import './AdminDashboard.css';

interface Statistics {
  totalCourses: number;
  pendingCourses: number;
  approvedCourses: number;
  rejectedCourses: number;
  totalInstructors: number;
  totalStudents: number;
}

interface RecentCourse {
  _id: string;
  title: string;
  instructor: {
    username: string;
  };
  approvalStatus: string;
  createdAt: string;
}

interface AdminStats {
  statistics: Statistics;
  recentCourses: RecentCourse[];
}

const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [token]);

  if (loading) {
    return (
      <div className="admin-loading">
        <FaSpinner className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <FaBook className="stat-icon" />
          <div className="stat-content">
            <h3>Total Courses</h3>
            <p className="stat-value">{stats?.statistics.totalCourses || 0}</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <FaSpinner className="stat-icon pending" />
          <div className="stat-content">
            <h3>Pending Approval</h3>
            <p className="stat-value">{stats?.statistics.pendingCourses || 0}</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <FaCheckCircle className="stat-icon approved" />
          <div className="stat-content">
            <h3>Approved</h3>
            <p className="stat-value">{stats?.statistics.approvedCourses || 0}</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <FaTimesCircle className="stat-icon rejected" />
          <div className="stat-content">
            <h3>Rejected</h3>
            <p className="stat-value">{stats?.statistics.rejectedCourses || 0}</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <FaGraduationCap className="stat-icon" />
          <div className="stat-content">
            <h3>Instructors</h3>
            <p className="stat-value">{stats?.statistics.totalInstructors || 0}</p>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <FaUsers className="stat-icon" />
          <div className="stat-content">
            <h3>Students</h3>
            <p className="stat-value">{stats?.statistics.totalStudents || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="admin-actions">
        <Link to="/admin/courses" className="admin-action-btn">
          Manage All Courses
        </Link>
        <Link to="/admin/pending-courses" className="admin-action-btn highlight">
          Review Pending Courses ({stats?.statistics.pendingCourses || 0})
        </Link>
      </div>
      
      <div className="admin-recent">
        <h2>Recent Courses</h2>
        <div className="admin-recent-list">
          {stats?.recentCourses && stats.recentCourses.length > 0 ? (
            <table className="admin-recent-table">
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
                {stats.recentCourses.map(course => (
                  <tr key={course._id}>
                    <td>{course.title}</td>
                    <td>{course.instructor.username}</td>
                    <td>
                      <span className={`status-badge ${course.approvalStatus}`}>
                        {course.approvalStatus.charAt(0).toUpperCase() + course.approvalStatus.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/course/${course._id}`} className="view-btn">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-courses">No recent courses found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
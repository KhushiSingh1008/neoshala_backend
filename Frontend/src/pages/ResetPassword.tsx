import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AuthPage.css'; // Reuse auth styling

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters long');
      return;
    }

    // Extract token from URL query parameters
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid password reset link. Please check your email and try again.');
      return;
    }

    try {
      setStatus('loading');
      setMessage('Resetting your password...');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Password reset successfully! You can now log in with your new password.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to reset password. Please try again or contact support.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while resetting your password. Please try again later.');
      console.error('Password reset error:', error);
    }
  };

  const handleGoToLogin = () => {
    navigate('/AuthPage');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter your new password</p>
        </div>

        {status !== 'success' ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {status === 'error' && <p className="error-message">{message}</p>}

            <button
              type="submit"
              className="submit-button"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="auth-content">
            <p className="success-message">{message}</p>
            <button
              type="button"
              onClick={handleGoToLogin}
              className="submit-button"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 
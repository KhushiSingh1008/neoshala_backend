import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css'; // Reuse auth styling

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already verified, redirect to profile
    if (user?.isVerified) {
      navigate('/profile');
      return;
    }

    // Extract token from URL query parameters
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    // Verify email
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in to your account.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to verify email. Please try again or contact support.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again later.');
        console.error('Email verification error:', error);
      }
    };

    verifyEmail();
  }, [user, navigate, location.search]);

  const handleGoToLogin = () => {
    navigate('/AuthPage');
  };

  const handleResendVerification = async () => {
    if (!user?.email) {
      setMessage('Please log in to resend verification email.');
      return;
    }

    try {
      setStatus('loading');
      setMessage('Sending verification email...');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Verification email resent successfully! Please check your email.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to resend verification email. Please try again or contact support.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while resending verification email. Please try again later.');
      console.error('Resend verification error:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Email Verification</h2>
        </div>

        <div className="auth-content">
          {status === 'loading' && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}

          <p className={`message ${status}`}>{message}</p>

          <div className="auth-actions">
            {status === 'success' && (
              <button
                type="button"
                onClick={handleGoToLogin}
                className="submit-button"
              >
                Go to Login
              </button>
            )}

            {status === 'error' && (
              <button
                type="button"
                onClick={handleResendVerification}
                className="submit-button"
              >
                Resend Verification Email
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 
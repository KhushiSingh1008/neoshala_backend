import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resendVerificationEmail } from '../services/authService';
import styled from 'styled-components';
import { FaExclamationTriangle, FaEnvelope } from 'react-icons/fa';

const Banner = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 12px 20px;
  margin: 10px 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
`;

const Message = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const ResendButton = styled.button`
  background-color: #1E90FF;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    background-color: #0078FF;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const EmailVerificationBanner: React.FC = () => {
  const { user, firebaseUser } = useAuth();
  const [isResending, setIsResending] = useState(false);

  // Only show if:
  // 1. User is logged in
  // 2. Firebase user exists
  // 3. Email is not verified
  // 4. Email is a real email (not dummy/example emails)
  if (!user || !firebaseUser || firebaseUser.emailVerified) {
    return null;
  }

  // Don't show for dummy/test emails
  if (firebaseUser.email?.includes('example.com') || 
      firebaseUser.email?.includes('test.com') ||
      firebaseUser.email?.startsWith('test@') ||
      firebaseUser.email?.startsWith('dummy@')) {
    return null;
  }

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      await resendVerificationEmail();
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Banner>
      <Message>
        <FaExclamationTriangle />
        <span>
          Please verify your email address to access all features. Check your inbox and spam folder.
        </span>
      </Message>
      <ResendButton 
        onClick={handleResendEmail} 
        disabled={isResending}
      >
        <FaEnvelope />
        {isResending ? 'Sending...' : 'Resend Email'}
      </ResendButton>
    </Banner>
  );
};

export default EmailVerificationBanner;
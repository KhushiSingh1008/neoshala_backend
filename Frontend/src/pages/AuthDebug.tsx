import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { resendVerificationEmail } from '../services/authService';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 15px;
`;

const InfoItem = styled.div`
  margin: 10px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const Button = styled.button`
  background: #1E90FF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  
  &:hover {
    background: #0078FF;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const AuthDebug: React.FC = () => {
  const { user, firebaseUser, loading } = useAuth();
  const [authState, setAuthState] = useState<any>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(user);
    });

    return () => unsubscribe();
  }, []);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      await resendVerificationEmail();
    } catch (error) {
      console.error('Failed to resend verification:', error);
    } finally {
      setIsResending(false);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      window.location.reload();
    }
  };

  return (
    <Container>
      <Title>🔧 Authentication Debug Panel</Title>
      
      <Section>
        <Title>Environment Variables</Title>
        <InfoItem>API URL: {import.meta.env.VITE_API_URL || 'Not set'}</InfoItem>
        <InfoItem>Firebase Auth Domain: {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Not set'}</InfoItem>
        <InfoItem>Firebase Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}</InfoItem>
        <InfoItem>Firebase API Key: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Not set'}</InfoItem>
      </Section>

      <Section>
        <Title>Auth Context State</Title>
        <InfoItem>Loading: {loading ? 'Yes' : 'No'}</InfoItem>
        <InfoItem>User exists: {user ? 'Yes' : 'No'}</InfoItem>
        {user && (
          <>
            <InfoItem>User ID: {user.id}</InfoItem>
            <InfoItem>Email: {user.email}</InfoItem>
            <InfoItem>Username: {user.username}</InfoItem>
            <InfoItem>Role: {user.role}</InfoItem>
            <InfoItem>Email Verified (Context): {user.isVerified ? 'Yes' : 'No'}</InfoItem>
          </>
        )}
      </Section>

      <Section>
        <Title>Firebase Auth State</Title>
        <InfoItem>Firebase User exists: {firebaseUser ? 'Yes' : 'No'}</InfoItem>
        {firebaseUser && (
          <>
            <InfoItem>Firebase UID: {firebaseUser.uid}</InfoItem>
            <InfoItem>Firebase Email: {firebaseUser.email}</InfoItem>
            <InfoItem>Firebase Display Name: {firebaseUser.displayName || 'Not set'}</InfoItem>
            <InfoItem>Firebase Email Verified: {firebaseUser.emailVerified ? 'Yes' : 'No'}</InfoItem>
            <InfoItem>Firebase Creation Time: {firebaseUser.metadata.creationTime}</InfoItem>
            <InfoItem>Firebase Last Sign In: {firebaseUser.metadata.lastSignInTime}</InfoItem>
          </>
        )}
      </Section>

      <Section>
        <Title>Direct Auth State (onAuthStateChanged)</Title>
        <InfoItem>Auth State exists: {authState ? 'Yes' : 'No'}</InfoItem>
        {authState && (
          <>
            <InfoItem>Direct UID: {authState.uid}</InfoItem>
            <InfoItem>Direct Email: {authState.email}</InfoItem>
            <InfoItem>Direct Email Verified: {authState.emailVerified ? 'Yes' : 'No'}</InfoItem>
          </>
        )}
      </Section>

      <Section>
        <Title>Actions</Title>
        {firebaseUser && !firebaseUser.emailVerified && (
          <Button 
            onClick={handleResendVerification} 
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        )}
        <Button onClick={refreshUser}>
          Refresh User Data
        </Button>
        <Button onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </Section>

      <Section>
        <Title>Troubleshooting Tips</Title>
        <InfoItem>
          <strong>If emails aren't being sent:</strong>
          <ul>
            <li>Check your Firebase project's Authentication settings</li>
            <li>Verify that Email/Password authentication is enabled</li>
            <li>Check spam/junk folder</li>
            <li>Try using a different email address</li>
          </ul>
        </InfoItem>
        <InfoItem>
          <strong>If "user already exists" error occurs:</strong>
          <ul>
            <li>The email is already registered in Firebase</li>
            <li>Try logging in instead of signing up</li>
            <li>Use the "Forgot Password" option if you don't remember the password</li>
          </ul>
        </InfoItem>
      </Section>
    </Container>
  );
};

export default AuthDebug;
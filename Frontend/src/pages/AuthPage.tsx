import React from 'react';
import SignUpForm from '../components/SignUpForm';
import LoginForm from '../components/LoginForm';
import './AuthPage.css';
import { useState } from 'react';

interface AuthPageProps {
  mode?: 'login' | 'signup';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode = 'login' }) => {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(mode);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={`tab ${currentMode === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentMode('login')}
          >
            Login
          </button>
          <button
            className={`tab ${currentMode === 'signup' ? 'active' : ''}`}
            onClick={() => setCurrentMode('signup')}
          >
            Sign Up
          </button>
        </div>
        
        {currentMode === 'login' ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  );
};

export default AuthPage;
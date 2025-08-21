import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const HelperContainer = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
`;

const Title = styled.h4`
  margin: 0 0 10px 0;
  color: #856404;
`;

const Message = styled.p`
  margin: 5px 0;
  font-size: 14px;
`;

const Button = styled.button`
  background: #1E90FF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px 5px 5px 0;
  font-size: 14px;
  
  &:hover {
    background: #0078FF;
  }
`;

const AuthHelper: React.FC = () => {
  const [showHelper, setShowHelper] = useState(true);

  const handleCreateTestAccount = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    toast.info(`To create a test account:\n1. Click "Sign up"\n2. Use email: test${randomNum}@example.com\n3. Use password: test123456\n4. Fill in name: Test User\n5. Select role: Student\n\nNote: Use a unique email each time!`, {
      autoClose: 10000,
      style: { whiteSpace: 'pre-line' }
    });
  };

  const handleCheckConsole = () => {
    toast.info('Open Developer Tools (F12) and check the Console tab for detailed error messages and debugging information.', {
      autoClose: 5000
    });
  };

  if (!showHelper) return null;

  return (
    <HelperContainer>
      <Title>🔧 Authentication Helper</Title>
      <Message>
        <strong>Having trouble logging in?</strong> This might be because you're trying to use credentials from your old Firebase project.
      </Message>
      <Message>
        <strong>Solution:</strong> You need to create a new account in the new Firebase project.
      </Message>
      
      <div style={{ marginTop: '10px' }}>
        <Button onClick={handleCreateTestAccount}>
          📝 How to Create Test Account
        </Button>
        <Button onClick={handleCheckConsole}>
          🔍 Check Console for Errors
        </Button>
        <Button onClick={() => setShowHelper(false)}>
          ❌ Hide Helper
        </Button>
      </div>
    </HelperContainer>
  );
};

export default AuthHelper;
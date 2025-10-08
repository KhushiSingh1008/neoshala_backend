import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthTest: React.FC = () => {
  const { user, token } = useAuth();

  const testAPI = async () => {
    try {
      console.log('🧪 Testing API with token:', token);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/enrolled`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data);
        alert(`Success! Found ${data.length} enrolled courses`);
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        alert(`Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      alert(`Network Error: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>🧪 Authentication Test</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>User:</strong> {user ? `${user.username} (${user.email})` : 'Not logged in'}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No token'}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>User ID:</strong> {user?._id || user?.id || 'No ID'}
      </div>
      <button 
        onClick={testAPI}
        disabled={!token}
        style={{
          padding: '10px 20px',
          backgroundColor: token ? '#007bff' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: token ? 'pointer' : 'not-allowed'
        }}
      >
        Test Enrolled Courses API
      </button>
    </div>
  );
};

export default AuthTest;

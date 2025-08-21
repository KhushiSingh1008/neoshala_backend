import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './AuthPage.css'; // Import the CSS file for global styles
import LogoSvg from '../assets/logo.svg';

// Using an online image URL instead of a local asset
const STUDENT_IMAGE_URL = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop';

const AuthPageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const ImageSection = styled.div`
  flex: 1;
  background-image: url(${STUDENT_IMAGE_URL});
  background-size: cover;
  background-position: center;
  display: none;
  
  @media (min-width: 768px) {
    display: block;
  }
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const AuthForm = styled.div`
  width: 100%;
  max-width: 400px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  img {
    height: 40px;
    margin-right: 10px;
  }
  
  span {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1E90FF;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6c757d;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #343a40;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    border-color: #1E90FF;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(30, 144, 255, 0.25);
  }
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #1E90FF;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  
  &:hover {
    background-color: #0078FF;
  }
  
  &:disabled {
    background-color: #74b3ff;
    cursor: not-allowed;
  }
`;

const ForgotPassword = styled.div`
  text-align: right;
  margin-bottom: 1.5rem;
  
  a {
    color: #1E90FF;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &::before, &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #ced4da;
  }
  
  span {
    padding: 0 10px;
    color: #6c757d;
  }
`;


const ToggleAuth = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  
  span {
    color: #6c757d;
  }
  
  button {
    background: none;
    border: none;
    color: #1E90FF;
    cursor: pointer;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: #f8d7da;
  padding: 0.75rem;
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  
  &:hover {
    color: #343a40;
  }
`;

interface FormData {
  username: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/profile');
      } else {
        await register(formData);
        // Don't navigate immediately after registration since email verification is required
        // The user will be redirected after email verification
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };


  if (loading) {
    return (
      <AuthPageContainer>
        <FormSection>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Loading...</p>
          </div>
        </FormSection>
      </AuthPageContainer>
    );
  }

  return (
    <AuthPageContainer>
      <ImageSection />
      <FormSection>
        <AuthForm>
          <LogoContainer>
            <img src={LogoSvg} alt="Neoshala Logo" />
            <span>Neoshala</span>
          </LogoContainer>
          
          <Title>{isLogin ? 'Login' : 'Sign up'}</Title>
          <Subtitle>{isLogin ? 'Welcome back!' : 'Create your account'}</Subtitle>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <FormGroup>
                <Label htmlFor="username">Full name</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </FormGroup>
            )}
            
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <PasswordContainer>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
                <PasswordToggle
                  type="button"
                  onClick={handleTogglePassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </PasswordToggle>
              </PasswordContainer>
            </FormGroup>
            
            {!isLogin && (
              <FormGroup>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="form-select"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #ced4da',
                    borderRadius: '0.25rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </FormGroup>
            )}
            
            {isLogin && (
              <ForgotPassword>
                <Link to="/forgot-password">Forgot Password?</Link>
              </ForgotPassword>
            )}
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign up'}
            </Button>
          </form>
          
          <Divider>
            <span>or {isLogin ? 'login' : 'sign up'} with</span>
          </Divider>
          
          <ToggleAuth>
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'} </span>
            <button type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </ToggleAuth>
        </AuthForm>
      </FormSection>
    </AuthPageContainer>
  );
};

export default AuthPage;
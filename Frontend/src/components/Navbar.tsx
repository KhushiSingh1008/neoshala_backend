import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import logo from '../assets/logo.svg';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { currentUser, userRole } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="navbar-brand">Neoshala</span>
        </Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <a href="#why-neoshala" className="nav-link">About Us</a>
        <Link to="/explore" className="nav-link">Explore</Link>
        
        {currentUser ? (
          <>
            {userRole === 'student' && (
              <>
                <Link to="/my-courses" className="nav-link">My Courses</Link>
                <Link to="/favourites" className="nav-link">Favorites</Link>
              </>
            )}
            {userRole === 'instructor' && (
              <Link to="/added-courses" className="nav-link">My Courses</Link>
            )}
            <Link to="/profile" className="nav-link profile-link">
              Profile
            </Link>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <Link to="/AuthPage" className="nav-link auth-link">
            Sign Up / Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
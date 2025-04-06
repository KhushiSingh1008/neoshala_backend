import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { NotificationBell } from './NotificationBell';
import logo from '../assets/logo.svg';
import './Navbar.css';
import styled from 'styled-components';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAboutClick = () => {
    setIsMenuOpen(false);
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const aboutSection = document.getElementById('why-neoshala');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const aboutSection = document.getElementById('why-neoshala');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" onClick={() => setIsMenuOpen(false)}>
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="navbar-brand">Neoshala</span>
        </Link>
      </div>
      
      <button 
        className="burger-menu" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <button onClick={handleAboutClick} className="nav-link about-link">About Us</button>
        {(!user || user.role === 'student') && (
          <Link to="/explore" className="nav-link" onClick={() => setIsMenuOpen(false)}>Explore</Link>
        )}
        
        {user ? (
          <>
            {user.role === 'student' && (
              <>
                <Link to="/my-courses" className="nav-link" onClick={() => setIsMenuOpen(false)}>My Courses</Link>
                <Link to="/favourites" className="nav-link" onClick={() => setIsMenuOpen(false)}>Favorites</Link>
                <Link to="/cart" className="nav-link cart-link" onClick={() => setIsMenuOpen(false)}>
                  <FaShoppingCart />
                  {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </Link>
              </>
            )}
            {user.role === 'instructor' && (
              <Link to="/added-courses" className="nav-link" onClick={() => setIsMenuOpen(false)}>My Courses</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
            )}
            <div className="notification-container">
              <NotificationBell />
            </div>
            <Link to="/profile" className="nav-link profile-link" onClick={() => setIsMenuOpen(false)}>
              Profile
            </Link>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <Link to="/AuthPage" className="nav-link auth-link" onClick={() => setIsMenuOpen(false)}>
            Sign Up / Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

export const StyledNavbar = styled.nav`
  .notification-container {
    position: relative;
    margin: 0 10px;
    display: flex;
    align-items: center;
  }
`;
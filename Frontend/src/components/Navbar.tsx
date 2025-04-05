import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';
import logo from '../assets/logo.svg';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleAboutClick = () => {
    // If we're not on the home page, navigate to home first
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for the navigation to complete before scrolling
      setTimeout(() => {
        const aboutSection = document.getElementById('why-neoshala');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If we're already on the home page, just scroll
      const aboutSection = document.getElementById('why-neoshala');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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
        <button onClick={handleAboutClick} className="nav-link about-link">About Us</button>
        {(!user || user.role === 'student') && (
          <Link to="/explore" className="nav-link">Explore</Link>
        )}
        
        {user ? (
          <>
            {user.role === 'student' && (
              <>
                <Link to="/my-courses" className="nav-link">My Courses</Link>
                <Link to="/favourites" className="nav-link">Favorites</Link>
                <Link to="/cart" className="nav-link cart-link">
                  <FaShoppingCart />
                  {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </Link>
              </>
            )}
            {user.role === 'instructor' && (
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
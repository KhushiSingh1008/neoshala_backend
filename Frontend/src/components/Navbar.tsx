import React from 'react';
import './Navbar.css';
import logo from '../assets/logo.svg';

interface NavbarProps {
  isLoggedIn?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn = false }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Logo" className="logo-img" />
        <span className="navbar-brand">Neoshala</span>
      </div>
      
      <div className="navbar-links">
        <a href="/" className="nav-link">Home</a>
        <a href="/about" className="nav-link">About Us</a>
        <a href="/search" className="nav-link">Search</a>
        <a href="/courses" className="nav-link">My Courses</a>
        <a href="/explore" className="nav-link">Explore</a>
        
        {isLoggedIn ? (
          <a href="/profile" className="nav-link profile-link">Profile</a>
        ) : (
          <a href="/auth" className="nav-link auth-link">Sign Up / Sign In</a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
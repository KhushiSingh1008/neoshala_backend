// Footer.tsx
import './Footer.css';
import logo from '../assets/logo.svg'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'; // Using react-icons for social media icons

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Column 1: Logo and Description */}
        <div className="footer-column">
          <div className="footer-logo">
            <img src={logo} alt="Neoshala Logo" className="logo-img" />
            <span className="logo-text">NEOSHALA</span>
          </div>
          <p className="footer-tagline">Neoshala - Skills for a Lifetime</p>
          <p className="footer-description">
            Empowering young minds with future-ready skills, creativity, and confidence to thrive in an ever-evolving world. Learning beyond textbooks, shaping leaders beyond classrooms.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="#why-neoshala">About Us</a></li>
            <li><a href="#programs">Programs</a></li>
            <li><a href="#blogs">Blogs & Insights</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Important Links */}
        <div className="footer-column">
          <h3 className="footer-heading">Important Links</h3>
          <ul className="footer-links">
            <li><a href="#terms">Terms and Conditions</a></li>
            <li><a href="#legal">Legal</a></li>
            <li><a href="#business">Business</a></li>
            <li><a href="#partners">Partners</a></li>
          </ul>
        </div>

        {/* Column 4: Social Media */}
        <div className="footer-column">
          <h3 className="footer-heading">Let's Stay Connected!</h3>
          <p className="footer-subtext">Reach out to explore, learn, and grow with Neoshala!</p>
          <div className="social-icons">
            <a href="https://facebook.com" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://twitter.com" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>© 2025 Neoshala Academy LLP</p>
        <p>Powered by Neoshala Academy LLP</p>
      </div>
    </footer>
  );
};

export default Footer;
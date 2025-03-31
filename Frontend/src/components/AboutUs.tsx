// AboutUs.tsx
import './AboutUs.css';

const AboutUs = () => {
  return (
    <section id="aboutUs" className="hero-section" aria-labelledby="about-heading">
      <div className="hero-overlay"></div>
      <div className="hero-container">
        <div className="hero-content">
          <h1 id="about-heading" className="hero-title">
           <span className="highlight">NeoShala</span>
          </h1>
          <p className="hero-subtitle">Skills for a Lifetime</p>
          <p className="hero-description">
            Empowering young minds with future-ready skills, creativity, and confidence to thrive in an ever-evolving world. 
            We go beyond textbooks to provide transformative learning experiences, shaping tomorrow's leaders.
          </p>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon"></span>
              <span>Future-Ready Skills</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon"></span>
              <span>Creativity Unleashed</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon"></span>
              <span>Leadership Development</span>
            </div>
          </div>
          <a href="#learn-more" className="hero-cta">
            Discover More
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
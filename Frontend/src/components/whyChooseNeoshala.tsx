import React from "react";
import "./whyChooseNeoshala.css";
import learningImage from "../assets/WhyNeoshala.jpg"; // Replace with actual image path

const WhyChooseNeoshala = () => {
  return (
    <section id = "why-neoshala" className="why-neoshala">
      <div className="why-neoshala-content">
        <h2>Why Choose Neoshala?</h2>
        <p>
          Neoshala is your gateway to a diverse range of non-academic coaching classes, 
          helping learners explore their passions and develop real-world skills. 
          We connect students with expert mentors in various fields, from arts to entrepreneurship.
        </p>
        <ul className="why-neoshala-list">
          <li>
            <strong>Expert-Led Coaching</strong> <br />
            Learn from industry professionals and seasoned mentors who bring real-world experience.
          </li>
          <li>
            <strong>Diverse Learning Paths</strong> <br />
            Whether it's music, sports, coding, or personal development, we offer tailored programs for every interest.
          </li>
          <li>
            <strong>Flexible & Accessible</strong> <br />
            Choose from online, in-person, or hybrid sessions that fit your schedule.
          </li>
          <li>
            <strong>Personalized Growth</strong> <br />
            Every learner gets a customized journey to explore their interests and reach their full potential.
          </li>
          <li>
            <strong>Community & Collaboration</strong> <br />
            Join a thriving network of learners, mentors, and industry experts who inspire and support each other.
          </li>
        </ul>
      </div>
      <div className="why-neoshala-image">
        <img src={learningImage} alt="Learning with Neoshala" />
      </div>
    </section>
  );
};

export default WhyChooseNeoshala;

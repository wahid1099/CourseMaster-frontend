import React from 'react';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="gradient-text">CourseMaster</h3>
            <p>Your gateway to world-class education.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="/">Courses</a>
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
          </div>
          
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#" aria-label="GitHub"><FiGithub size={20} /></a>
              <a href="#" aria-label="Twitter"><FiTwitter size={20} /></a>
              <a href="#" aria-label="LinkedIn"><FiLinkedin size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CourseMaster. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

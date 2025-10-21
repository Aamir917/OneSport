// Footer.js

import React from 'react';
import './footer.css';  // Optional CSS file for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://www.facebook.com" target="Facebook" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>123 Sports Gear Hub Ave,</p>
          <p>City, Country</p>
          <p>Email: info@sportsgearhub.com</p>
          <p>Phone: +123 456 7890</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Sports Gear Hub. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

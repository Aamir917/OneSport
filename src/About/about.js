// About.js

import React from 'react';
import './About.css';
import { motion } from 'framer-motion';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'Mohd Aamir',
    role: 'Founder & CEO',
    image: 'https://via.placeholder.com/150',
    bio: 'John is the visionary behind Sports Gear Hub with over 10 years of experience in the sports industry.',
  },
  {
    name: 'XYZ',
    role: 'Head of Marketing',
    image: 'https://via.placeholder.com/150',
    bio: 'Jane leads our marketing team with creative strategies and innovative campaigns.',
  },
  {
    name: 'Mike Johnson',
    role: 'Lead Designer',
    image: 'https://via.placeholder.com/150',
    bio: 'Mike designs our product line, ensuring quality and performance.',
  },
  // Add more team members as needed
];

const timeline = [
  {
    year: '2015',
    event: 'Company Founded',
  },
  {
    year: '2016',
    event: 'First Major Product Launched',
  },
  {
    year: '2018',
    event: 'Expanded to International Markets',
  },
  {
    year: '2020',
    event: 'Reached 1 Million Customers',
  },
  {
    year: '2024',
    event: 'Celebrating 9 Years of Excellence',
  },
];

const About = () => {
  return (
    <div className="about-page">
      {/* Banner Section */}
      <section className="about-banner">
        <div className="banner-overlay">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            About Us
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Your Trusted Source for Quality Sports Gear
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-section">
        <div className="container">
          <motion.div
            className="mission-vision"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2>Our Mission</h2>
            <p>
              At Sports Gear Hub, our mission is to provide athletes, fitness enthusiasts, and sports lovers with the best sports equipment and apparel. 
              Whether you're a professional athlete or just starting your fitness journey, we offer high-quality products to help you achieve your goals.
            </p>
          </motion.div>

          <motion.div
            className="mission-vision"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h2>Our Vision</h2>
            <p>
              To be the leading provider of sports gear worldwide, fostering a community where passion for sports meets unparalleled quality and innovation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Team */}
      <section className="team-section">
        <div className="container">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <motion.div
                className="team-card"
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <p className="role">{member.role}</p>
                  <p className="bio">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="timeline-section">
        <div className="container">
          <h2>Our Journey</h2>
          <div className="timeline">
            {timeline.map((item, index) => (
              <div className="timeline-item" key={index}>
                <div className="timeline-year">{item.year}</div>
                <div className="timeline-event">{item.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Community */}
      <section className="community-section">
        <div className="container">
          <h2>Join Our Community</h2>
          <p>
            Whether you're shopping for gear, browsing our blog for tips, or following us on social media, we’re here to inspire and support you. 
            Join the Sports Gear Hub community and take your performance to the next level!
          </p>
          <div className="social-icons">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

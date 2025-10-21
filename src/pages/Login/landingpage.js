import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landingpage.css'; // Ensure this path is correct or create this CSS file

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token from localStorage
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <h2>Welcome to the Dashboard!</h2>
        <p>This is the landing page after successful login.</p>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </div>
  );
};

export default LandingPage;

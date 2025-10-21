import { useState } from "react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import styles from './loginpage.css'; // Ensure this is the correct path to your CSS module

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.email && data.password) {
      try {
        const response = await fetch("http://localhost:5000/user/loginpage", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          // Save the token or user info to local storage/session storage if needed
          localStorage.setItem("token", result.data); // Assuming the token is in result.data
          // Navigate to the landing page after successful login
          navigate("/landing"); // Replace with your actual landing page route
        } else {
          setError(result.message || "Login failed");
        }
      } catch (err) {
        console.error("Error during login:", err);
        setError("An error occurred during login. Please try again.");
      }
    } else {
      setError("All fields are required");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              onChange={handleChange}
              value={data.email}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              onChange={handleChange}
              value={data.password}
            />
          </div>
          {error && <div className={styles.error_msg}>{error}</div>}
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="signup-link">
          Don't have an account? <button className="signup-link-button" onClick={() => navigate('/signup')}>Sign up</button>
        </p>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import axios from 'axios';
import './signup.css';

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // For showing a loading state
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate the form
  const validate = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setLoading(true);
      try {
        // Sending the data to the server
        const response = await axios.post('http://localhost:5000/api/register', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Success case
        setSuccessMessage(response.data.message || 'User registered successfully!');
        setFormData({
          name: '',
          email: '',
          password: '',
        });
        setErrors({});
      } catch (err) {
        // Handle error response from the server
        if (err.response && err.response.data && err.response.data.message) {
          setErrors({ general: err.response.data.message });
        } else {
          setErrors({ general: 'Error registering user. Please try again later.' });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="signup-page">
      <div className="form-container">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>

          {errors.general && <div className="error">{errors.general}</div>}
          {successMessage && <div className="success">{successMessage}</div>}
          {loading && <div className="loading">Submitting...</div>}

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './signup.css';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(1, 'Password is required').required('Password is required'),
});

function SignupPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password, // plain text
      });

      alert(response.data.message || 'User registered successfully!');
      reset();
      navigate('/login');
    } catch (err) {
      setError('general', {
        type: 'manual',
        message: err.response?.data?.message || 'Registration failed',
      });
    }
  };

  return (
    <div className="signup-page">
      <div className="form-container">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Name</label>
            <input {...register('name')} />
            {errors.name && <div className="error">{errors.name.message}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" {...register('email')} />
            {errors.email && <div className="error">{errors.email.message}</div>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" {...register('password')} />
            {errors.password && <div className="error">{errors.password.message}</div>}
          </div>
          {errors.general && <div className="error">{errors.general.message}</div>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;

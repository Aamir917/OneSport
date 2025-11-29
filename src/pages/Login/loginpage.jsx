import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './loginpage.css';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

function LoginPage({ setUserState }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email: data.email.trim(),
        password: data.password,
      });

      if (response.data.success) {
        // ✅ Save JWT token & user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // ✅ Update Navbar state
        if (setUserState) setUserState(response.data.user);

        // ✅ Redirect to homepage
        navigate('/');
      } else {
        setError('general', { type: 'manual', message: response.data.message });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('general', {
        type: 'manual',
        message: err.response?.data?.message || 'Login failed',
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
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
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

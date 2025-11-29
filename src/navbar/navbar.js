import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './navbar.css';

function Navbar({ user, setUserState }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Listen to storage changes or initial load
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);
  }, []);

  // Optional: if adminToken changes while navbar is mounted
  useEffect(() => {
    const handleStorageChange = () => {
      const adminToken = localStorage.getItem('adminToken');
      setIsAdmin(!!adminToken);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
      navigate('/admin-login');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUserState(null);
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="LogoOS.png" alt="Company Logo" />
      </div>
      <ul className="navbar-links">
        {!isAdmin && (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/products">Products</Link></li>
          </>
        )}

        {isAdmin ? (
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        ) : user ? (
          <>
            <li>Hello, {user.name}</li>
            <li><Link to="/cart">Cart</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;

// src/Navbar.js
import React from 'react';
import './navbar.css';
import '../LogoOS.png';
//import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="LogoOS.png" alt="Company Logo" />
      </div>
      <ul className="navbar-links">
        <li><a href="/">Home</a></li>
        <li><a href="/About">About</a></li>
        <li><a href="#products">Products</a></li>
        <li><a href="/cart">Cart</a></li>
        <li><a href="/loginpage">Login</a></li>
        <li><a href="/signup">Signup</a></li>
      </ul>
      
    </nav>
  );
}

export default Navbar;

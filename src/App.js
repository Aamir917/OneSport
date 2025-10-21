import React from 'react';
import HomePage from './pages/homepage/homepage';
import Login from './pages/Login/loginpage';
import Signup from './pages/signup/signup';
import CartPage from './pages/cart/cartpage';
import About from './About/about';
import Admin from './pages/Admin/admin.jsx';
import LandingPage from './pages/Login/landingpage.js';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/loginpage" element={<Login />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;

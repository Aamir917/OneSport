import React, { useState, useEffect } from 'react';
//import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './navbar/navbar.js';
import HomePage from './pages/homepage/homepage';
import Login from './pages/Login/loginpage';
import Signup from './pages/signup/signup';
import Cart from './pages/cart/cartpage';
import About from './About/about';
import AdminPage from './pages/Admin/adminpage.jsx';
import AdminLogin from './pages/Admin/AdminLogin.jsx';
import LandingPage from './pages/Login/landingpage.jsx';
import ProductPage from './pages/Products/Products.jsx';
import Footer from './footer/footer.js';    // ⬅️ Make sure footer is imported

// PrivateRoute for React Router v6
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin-login" />;
  return children;
};

function App() {
  const [user, setUserState] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUserState(storedUser);
  }, []);

  return (
    <div className="app-container">   {/* ⬅️ Entire app wrapper */}

      <Router>
        <Navbar user={user} setUserState={setUserState} />

        <div className="content-wrap">  {/* ⬅️ Content grow area */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login setUserState={setUserState} />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/products" element={<ProductPage />} />
<Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
<Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><LandingPage /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <Footer />  {/* ⬅️ Footer stays at bottom */}
      </Router>
    </div>
  );
}

export default App;

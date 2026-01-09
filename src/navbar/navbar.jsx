import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";
import logo from "../LogoOS.png";

function Navbar({ user, setUserState }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  const isAdminLoginPage = location.pathname === "/admin-login";

  // Load user + admin state whenever route changes
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUserState(storedUser);

    const adminToken = localStorage.getItem("adminToken");
    setIsAdmin(!!adminToken);
  }, [setUserState, location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Normal user logout (clears user + tokens)
  const handleUserLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    setUserState(null);
    setMenuOpen(false);
    navigate("/login");
  };

  // Admin logout (only clears admin token)
  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAdmin(false);
    navigate("/admin-login");
  };

  const handleMenuItemClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Logo" />
        </Link>
      </div>

      <ul className="navbar-links">
        {/* Top-level nav links (hidden in admin mode) */}
        {!isAdmin && (
          <>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </>
        )}

        {/* ADMIN MODE: only show Admin + Logout */}
        {isAdmin ? (
          <>
            <li className="admin-nav-label">Admin</li>
            <li>
              <button className="login-btn" onClick={handleAdminLogout}>
                Logout
              </button>
            </li>
          </>
        ) : user ? (
          // NORMAL USER DROPDOWN
          <li className="user-dropdown" ref={dropdownRef}>
            <span
              onClick={() => setMenuOpen(!menuOpen)}
              className="user-name"
            >
              Hello, {user.name} ▼
            </span>

            {menuOpen && (
              <div className="dropdown-menu">
                {/* My Profile → My Details section */}
                <Link
                  to="/profile?section=details"
                  onClick={handleMenuItemClick}
                >
                  My Profile
                </Link>

                {/* My Wishlist → Wishlist section */}
                <Link
                  to="/profile?section=wishlist"
                  onClick={handleMenuItemClick}
                >
                  My Wishlist
                </Link>

                {/* My Cart */}
                <Link to="/cart" onClick={handleMenuItemClick}>
                  My Cart
                </Link>

                {/* My Orders → Orders section */}
                <Link
                  to="/profile?section=orders"
                  onClick={handleMenuItemClick}
                >
                  My Orders
                </Link>

                {/* Logout */}
                <button onClick={handleUserLogout}>Logout</button>
              </div>
            )}
          </li>
        ) : (
          // NOT LOGGED IN (user) → hide on admin-login page
          !isAdminLoginPage && (
            <>
              <li>
                <Link className="login-btn" to="/login">
                  Login
                </Link>
              </li>
              <li>
                <Link className="signup-btn" to="/signup">
                  Signup
                </Link>
              </li>
            </>
          )
        )}
      </ul>
    </nav>
  );
}

export default Navbar;

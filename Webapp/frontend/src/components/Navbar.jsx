import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    function closeOnResize() {
      setMenuOpen(false);
    }

    if (menuOpen) {
      window.addEventListener("resize", closeOnResize);
    }

    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }

    return () => {
      window.removeEventListener("resize", closeOnResize);
    };
  }, [menuOpen, darkMode]);

  return (
    <nav className="navbar">
      <div className={`navbar-left ${menuOpen ? "menu-open" : ""}`}>
        <button
          aria-label="Toggle menu"
          className="hamburger-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </button>
        <Link to="/" className="navbar-link">
          Home
        </Link>
        {user && user.role === "doctor" && (
          <>
            <Link to="/doctor/profile" className="navbar-link">
              Dashboard
            </Link>
            <Link to="/doctor/clients" className="navbar-link">
              Browse Clients
            </Link>
          </>
        )}
        {user && user.role !== "doctor" && (
          <>
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
            <Link to="/prediction" className="navbar-link">
              Predict
            </Link>
            <Link to="/profile" className="navbar-link">
              Profile
            </Link>
            <Link to="/connection-requests" className="navbar-link">
              View Doctor Requests
            </Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label="Toggle Dark Mode"
          title="Toggle Dark Mode"
          className="navbar-link"
          style={{ padding: "10px 16px", cursor: "pointer" }}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div
            className="dropdown"
            onMouseEnter={() => setDropdownVisible(true)}
            onMouseLeave={() => setDropdownVisible(false)}
          >
            <span className="dropdown-toggle">{user.firstName}</span>
            {dropdownVisible && (
              <div className="dropdown-menu">
                <p>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
                <button onClick={logout} className="logout-button">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/signup" className="navbar-link">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

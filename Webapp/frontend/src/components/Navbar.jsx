import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Sun, Moon } from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <nav className="navbar" style={{ animation: "fadeIn 0.8s ease" }}>
      <div className="navbar-left">
        {user && user.role === "doctor" && (
          <>
                      <Link to="/doctor/dashboard" className="navbar-link">
              Dashboard
            </Link>
            <Link to="/doctor/profile" className="navbar-link">
              Clients
            </Link>
            <Link to="/doctor/clients" className="navbar-link">
              Browse Clients
            </Link>
          </>
        )}
        {user && user.role !== "doctor" && (
          <>
                  <Link to="/" className="navbar-link" aria-label="Home">
          Home
        </Link>
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
              Doctor Requests
            </Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        <button
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Dark Mode"
          title="Toggle Dark Mode"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            marginRight: "16px",
            color: "var(--color-text-primary)",
          }}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user ? (
          <div
            className="dropdown"
            onMouseEnter={() => setDropdownVisible(true)}
            onMouseLeave={() => setDropdownVisible(false)}
          >
            <span
              className="dropdown-toggle"
              tabIndex={0}
              aria-haspopup="true"
              aria-expanded={dropdownVisible}
            >
              {user.firstName}
            </span>
            {dropdownVisible && (
              <div className="dropdown-menu" role="menu">
                <p>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
                <button onClick={logout} className="logout-button" role="menuitem">
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

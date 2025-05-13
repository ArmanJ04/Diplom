import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Toggle the dropdown visibility
  const handleDropdownToggle = () => {
    setDropdownVisible((prevState) => !prevState);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-link">Home</Link>
      {user ? (
        <>
          {user.role === "doctor" ? (
            <>
              <Link to="/doctor/profile" className="navbar-link">Dashboard</Link>
              <Link to="/doctor/clients" className="navbar-link">Browse Clients</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <Link to="/prediction" className="navbar-link">Predict</Link>
              <Link to="/profile" className="navbar-link">Profile</Link>
              <Link to="/connection-requests" className="navbar-link">View Doctor Requests</Link>
            </>
          )}
          <div className="dropdown">
            <span className="dropdown-toggle" onClick={handleDropdownToggle}>
              {user.firstName}
            </span>
            {dropdownVisible && (
              <div className="dropdown-menu">
                <p>{user.role}</p>
                <button onClick={logout} className="logout-button">Logout</button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <Link to="/login" className="navbar-link">Login</Link>
          <Link to="/signup" className="navbar-link">Sign Up</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;

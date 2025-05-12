import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      {user ? (
  <>
    {user.role === "doctor" ? (
      <>
        <Link to="/doctor/profile">Dashboard</Link>
        <Link to="/doctor/clients">Browse Clients</Link>
      </>
    ) : (
      <>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/prediction">Predict</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/connection-requests" className="text-blue-600 hover:underline">View Doctor Requests</Link>

      </>
    )}
    <button onClick={logout}>Logout</button>
  </>
) : (
  <>
    <Link to="/login">Login</Link>
    <Link to="/signup">Sign Up</Link>
  </>
)}
    </nav>
  );
}

export default Navbar;

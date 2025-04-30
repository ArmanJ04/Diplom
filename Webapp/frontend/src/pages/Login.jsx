import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [uin, setUin] = useState(""); // Changed from 'email' to 'uin'
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(uin, password); // Use 'uin' instead of 'email'

    if (result === "success") {
      window.alert("Login successful!");
      setUin(""); // Reset UIN field
      setPassword(""); // Reset password field
      navigate("/dashboard");
    } else {
      window.alert(result); // Display the error message
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text" // Changed input type from 'email' to 'text' for UIN
          placeholder="UIN" // Updated placeholder to "UIN"
          value={uin}
          onChange={(e) => setUin(e.target.value)} // Use 'uin' state instead of 'email'
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
    </div>
  );
}

export default Login;

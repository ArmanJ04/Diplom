import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [uin, setUin] = useState("");
  const [password, setPassword] = useState("");
  const { login, setUser } = useContext(AuthContext); // Add setUser to update context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login(uin, password);

      console.log("Login result:", result);  // Debugging log to check the result

      if (result === "success") {
        const storedUser = JSON.parse(localStorage.getItem("user")); // Load user from localStorage

        console.log("Stored user:", storedUser); // Debugging log to check the user

        if (storedUser.role === "doctor" && !storedUser.doctorApproved) {
          window.alert("Your doctor account is not approved yet. Please wait for admin confirmation.");
          return;
        }

        // Update context with the new user
        setUser(storedUser);

        window.alert("Login successful!");
        setUin("");
        setPassword("");

        if (storedUser.role === "doctor") {
          navigate("/doctorPage"); // Navigate to doctor page
        } else {
          navigate("/dashboard"); // Navigate to patient dashboard
        }
      } else {
        window.alert("Login error: " + result);  // Log detailed error message
      }
    } catch (error) {
      console.error("Login failed:", error);  // Log the error in case of failure
      window.alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="UIN"
          value={uin}
          onChange={(e) => setUin(e.target.value)}
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

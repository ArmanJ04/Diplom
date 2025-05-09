// src/pages/Login.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Ensure this path is correct
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [uin, setUin] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext); // Get the login function from context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(uin, password); // Call login from AuthContext

      if (result && result.status === "success" && result.user) {
        // Login was successful, user data is in result.user
        // AuthContext already handles setUser and localStorage
        if (result.user.role === "doctor") {
          navigate("/doctorPage");
        } else {
          navigate("/dashboard");
        }
      } else {
        // Login failed, result.message should contain the error
        window.alert(result.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      // This catch block handles unexpected errors during the login call itself
      console.error("Login handleSubmit error:", error);
      window.alert("An unexpected error occurred during login.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-gray-50 p-6">
      <h2 className="text-3xl font-semibold">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="UIN (12 digits)"
          value={uin}
          onChange={(e) => setUin(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          minLength="12"
          maxLength="12"
          pattern="\d{12}"
          title="UIN must be exactly 12 digits."
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
          Login
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/signup" className="text-primary">Sign up here</Link>
      </p>
      <p>
        <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot Password?</Link>
      </p>
    </div>
  );
}

export default Login;

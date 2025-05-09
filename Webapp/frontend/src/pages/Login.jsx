import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [uin, setUin] = useState("");
  const [password, setPassword] = useState("");
  const { login, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(uin, password);
      if (result === "success") {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
        if (storedUser.role === "doctor") {
          navigate("/doctorPage");
        } else {
          navigate("/dashboard");
        }
      } else {
        alert("Login failed");
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-gray-50 p-6">
      <h2 className="text-3xl font-semibold">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="UIN"
          value={uin}
          onChange={(e) => setUin(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
    </div>
  );
}

export default Login;

// Redesigned Login.jsx (Simple and Friendly for All Ages)
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";

function Login() {
  const [uin, setUin] = useState("");
  const [password, setPassword] = useState("");
  const { login, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loggedUser = await login(uin, password);
    if (loggedUser && loggedUser.role) {
      setUser(loggedUser);
      navigate(loggedUser.role === "doctor" ? "/doctor/profile" : "/dashboard");
    } else {
      alert("Login failed.");
    }
    
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-50 px-6">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">Login to CardioCare</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your UIN"
            value={uin}
            onChange={(e) => setUin(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md flex justify-center items-center gap-2 hover:bg-blue-700"
          >
            <LogIn className="w-4 h-4" /> Login
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up here</Link>
          </p>
          <p className="mt-1">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

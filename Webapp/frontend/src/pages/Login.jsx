import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";

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
      toast.error("Login failed.");
    }
  };

  return (
<div className="page-background" style={{ minHeight: "100vh", padding: "60px 20px" }}>
      <div className="page-centered">
        <h2>Login to CardioCare</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <input
            type="text"
            placeholder="Enter your UIN"
            value={uin}
            onChange={(e) => setUin(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-icon">
            <LogIn className="w-6 h-6" />
            Login
          </button>
        </form>
        <div className="small-text mt-8">
          <p>
            Don't have an account?{" "}
            <Link to="/signup">Sign up here</Link>
          </p>
          <p className="mt-3">
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

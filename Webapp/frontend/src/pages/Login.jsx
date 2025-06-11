import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";

function Login() {
  const [uin, setUin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (uin === "123456789012" && password === "admin123") {
      localStorage.setItem("isAdminLoggedIn", "true");
      toast.success("Admin logged in");
      navigate("/admin");
      setLoading(false);
      return;
    }

    const loggedUser = await login(uin, password);
    if (loggedUser && loggedUser.role) {
      setUser(loggedUser);
      toast.success("Login successful!");
      navigate(loggedUser.role === "doctor" ? "/doctor/dashboard" : "/dashboard");
    } else {
      toast.error("Login failed.");
    }
  } catch (error) {
const msg =
  (error.response &&
    (error.response.data?.message || error.response.data?.error)) ||
  error.message ||
  "Login failed. Please check your credentials.";
toast.error(msg);

  } finally {
    setLoading(false);
  }
};
  return (
    <div
      className="page-background"
      style={{
        minHeight: "100vh",
        padding: "80px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="page-centered"
        style={{
          maxWidth: "480px",
          animation: "fadeIn 0.9s ease",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "40px 35px",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            color: "var(--color-primary)",
            fontWeight: "800",
            fontSize: "2.5rem",
            marginBottom: "32px",
            textAlign: "center",
          }}
        >
          Login to CardioCare
        </h2>

        <label
          htmlFor="uin"
          style={{ fontWeight: 600, marginBottom: 8, color: "var(--color-text-primary)" }}
        >
          UIN
        </label>
        <input
          id="uin"
          type="text"
          placeholder="Enter your UIN"
          value={uin}
          onChange={(e) => setUin(e.target.value)}
          required
          disabled={loading}
          style={{
            fontSize: "1rem",
            padding: "14px 18px",
            borderRadius: "14px",
            border: "1.5px solid #d1d5db",
            width: "100%",
            boxSizing: "border-box",
          }}
        />

        <label
          htmlFor="password"
          style={{ fontWeight: 600, marginBottom: 8, color: "var(--color-text-primary)" }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          style={{
            fontSize: "1rem",
            padding: "14px 18px",
            borderRadius: "14px",
            border: "1.5px solid #d1d5db",
            width: "100%",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          aria-busy={loading}
          style={{
            padding: "16px 0",
            fontSize: "1.2rem",
            borderRadius: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
            width: "100%",
          }}
        >
          {loading ? (
            <>
              <svg
                role="status"
                className="animate-spin"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Loading"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.25"
                />
                <path
                  d="M22 12a10 10 0 00-10-10"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              Loading...
            </>
          ) : (
            <>
              <LogIn size={24} />
              Login
            </>
          )}
        </button>

        <div
          className="small-text"
          style={{ marginTop: "28px", textAlign: "center", fontSize: "0.95rem" }}
        >
          <p>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "var(--color-primary)" }}>
              Sign up here
            </Link>
          </p>
          <p className="mt-3">
            <Link to="/forgot-password" style={{ color: "var(--color-primary)" }}>
              Forgot Password?
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;

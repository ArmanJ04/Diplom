import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "",
    firstName: "",
    lastName: "",
    uin: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(formData.uin)) {
      alert("UIN must be exactly 12 digits.");
      return;
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    const result = await signup(formData);
    if (result.status === "success") {
      alert("Signup successful!");
      navigate("/profile");
    } else {
      alert("Signup failed: " + result.message);
    }
  };

  return (
    <div className="page-background" style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="page-centered">
        <h2>Create Your CardioCare Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={{ color: formData.role ? "inherit" : "var(--color-text-secondary)" }}
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="uin"
            placeholder="UIN (12 digits)"
            value={formData.uin}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-icon">
            <UserPlus className="w-6 h-6" />
            Sign Up
          </button>
        </form>
        <div className="small-text mt-8">
          <p>
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

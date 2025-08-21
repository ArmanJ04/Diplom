import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";

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
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    const result = await signup(formData);
    if (result.status === "success") {
      toast.success("Signup successful!");
      navigate("/profile");
    } else {
      toast.error("Signup failed: " + result.message);
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
        style={{ maxWidth: "480px", animation: "fadeIn 0.9s ease" }}
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
          Create Your CardioCare Account
        </h2>
        <label htmlFor="role">Select Role</label>
        <select
          id="role"
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

        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <label htmlFor="uin">UIN (12 digits)</label>
        <input
          id="uin"
          type="text"
          name="uin"
          placeholder="UIN (12 digits)"
          value={formData.uin}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="btn-primary"
          style={{
            marginTop: "20px",
            padding: "16px 0",
            fontSize: "1.2rem",
            borderRadius: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <UserPlus size={24} />
          Sign Up
        </button>

        <p className="small-text" style={{ marginTop: "28px" }}>
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup; 

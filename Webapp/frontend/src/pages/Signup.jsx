import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

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
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{12}$/.test(formData.uin)) {
      window.alert("UIN must be exactly 12 digits.");
      return;
    }

    if (formData.password.length < 8) {
      window.alert("Password must be at least 8 characters long.");
      return;
    }

    try {
      await signup(formData);
      window.alert("Signup successful!");
  
      if (formData.role === "patient") {
        navigate("/profile");
      } else if (formData.role === "doctor") {
        window.alert("Your account must be verified by an administrator before full access.");
        navigate("/doctorPage"); // 👈 заменено здесь
      }
    } catch (error) {
      window.alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="">Select Role</option>
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

        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Signup;

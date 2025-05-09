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
      alert("UIN must be exactly 12 digits.");
      return;
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    try {
      await signup(formData);
      alert("Signup successful!");
      navigate("/profile");
    } catch (error) {
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 space-y-6">
      <h2 className="text-3xl font-semibold">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
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
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          name="uin"
          placeholder="UIN"
          value={formData.uin}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
          Sign Up
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login" className="text-primary">Log in here</Link>
      </p>
    </div>
  );
}

export default Signup;

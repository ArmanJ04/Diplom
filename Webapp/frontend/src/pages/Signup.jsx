// Redesigned Signup.jsx (Clear and Accessible Healthcare Registration)
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-50 px-6">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">Create Your CardioCare Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select name="role" value={formData.role} onChange={handleChange} required className="input">
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
            className="input"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            type="text"
            name="uin"
            placeholder="UIN (12 digits)"
            value={formData.uin}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input"
          />
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md flex justify-center items-center gap-2 hover:bg-blue-700">
            <UserPlus className="w-4 h-4" /> Sign Up
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PasswordRecovery() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/request-password-reset`, { email });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage("Failed to send recovery email.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-gray-50 p-6">
      <h2 className="text-3xl font-semibold">Password Recovery</h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
          Recover Password
        </button>
      </form>
      {message && <p className="text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
}

export default PasswordRecovery;

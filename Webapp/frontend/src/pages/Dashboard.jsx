import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-primary">Welcome, {user?.name}</h1>
      <p className="text-lg text-gray-600">Manage your health with AI-driven predictions.</p>
      <Link to="/prediction">
        <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
          Make Prediction
        </button>
      </Link>
    </div>
  );
}

export default Dashboard;

// Redesigned Dashboard.jsx (Patient View with Quick Access Cards)
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, FileBarChart2, UserCircle2 } from "lucide-react";

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-600">Your personalized heart health dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Link to="/prediction" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <Stethoscope className="w-10 h-10 text-blue-600 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Make a Prediction</h2>
          <p className="text-sm text-gray-500">Check your current cardiovascular risk in minutes.</p>
        </Link>

        <Link to="/profile" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <UserCircle2 className="w-10 h-10 text-green-600 mb-3" />
          <h2 className="text-xl font-semibold mb-2">My Profile</h2>
          <p className="text-sm text-gray-500">Update your health details and view history.</p>
        </Link>

        <Link to="/doctor" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <FileBarChart2 className="w-10 h-10 text-indigo-600 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Doctor Info</h2>
          <p className="text-sm text-gray-500">Review your assigned doctor and their feedback.</p>
        </Link>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={handleLogout}
          className="text-red-600 hover:underline text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;

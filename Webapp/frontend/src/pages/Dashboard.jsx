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
    <div className="page-container">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-700 text-lg">Your personalized heart health dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Link to="/prediction" className="bg-white rounded-xl shadow p-8 hover:shadow-lg transition flex flex-col items-center gap-3">
          <Stethoscope className="w-12 h-12 text-blue-600" />
          <h2 className="text-xl font-semibold">Make a Prediction</h2>
          <p className="text-sm text-gray-600 text-center">Check your current cardiovascular risk in minutes.</p>
        </Link>

        <Link to="/profile" className="bg-white rounded-xl shadow p-8 hover:shadow-lg transition flex flex-col items-center gap-3">
          <UserCircle2 className="w-12 h-12 text-green-600" />
          <h2 className="text-xl font-semibold">My Profile</h2>
          <p className="text-sm text-gray-600 text-center">Update your health details and view history.</p>
        </Link>

        <Link to="/doctor" className="bg-white rounded-xl shadow p-8 hover:shadow-lg transition flex flex-col items-center gap-3">
          <FileBarChart2 className="w-12 h-12 text-indigo-600" />
          <h2 className="text-xl font-semibold">Doctor Info</h2>
          <p className="text-sm text-gray-600 text-center">Review your assigned doctor and their feedback.</p>
        </Link>
      </div>

      <div className="mt-16 text-center">
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

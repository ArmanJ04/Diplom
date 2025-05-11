// Redesigned Home.jsx (Healthcare Friendly Landing Page)
import { Link } from "react-router-dom";
import { HeartPulse, UserPlus, LogIn } from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-cyan-500 to-blue-700 text-white px-4 py-10">
      <HeartPulse className="w-16 h-16 mb-4 animate-pulse" />
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Welcome to CardioCare</h1>
      <p className="text-lg md:text-xl text-center max-w-xl mb-8">
        Use artificial intelligence to check your heart health risk. Safe. Simple. For everyone.
      </p>
      <div className="flex flex-col md:flex-row gap-4">
        <Link to="/login">
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-100 transition">
            <LogIn className="w-5 h-5" /> Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-100 transition">
            <UserPlus className="w-5 h-5" /> Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;

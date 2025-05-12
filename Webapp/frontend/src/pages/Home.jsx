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
    </div>
  );
}

export default Home;

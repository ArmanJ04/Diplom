import { Link } from "react-router-dom";
import { useAlert } from '../context/AlertContext';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white space-y-6">
      <h1 className="text-4xl font-semibold">Welcome to CVD Prediction</h1>
      <p className="text-lg">Your health matters. Predict cardiovascular disease risk easily.</p>
      <Link to="/login">
        <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition">
          Get Started
        </button>
      </Link>
    </div>
  );
}

export default Home;

// App.jsx
import { useAuth } from "./context/AuthContext";
import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Prediction from "./pages/Prediction";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import PredictionList from "./components/PredictionList";
import DoctorPage from "./pages/DoctorPage";
import PasswordRecovery from "./pages/PasswordRecovery";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./styles/styles.css";

function App() {
  const { user, logout } = useAuth();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        alert("Вы были автоматически разлогинены из-за бездействия.");
        logout();
      }, 300_000);
    };

    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, logout]);

  // Test notification when the app loads
  useEffect(() => {
    toast.info("Добро пожаловать в систему!", {
      position: "top-center",
      autoClose: 3000,
    });
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/prediction" element={user ? <Prediction /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/doctorPage" element={<DoctorPage />} />
          <Route path="/doctor/patients/:uin/predictions" element={<PredictionList />} />
          <Route path="/forgot-password" element={<PasswordRecovery />} />
        </Routes>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;

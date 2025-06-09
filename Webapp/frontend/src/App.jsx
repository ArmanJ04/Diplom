import { useAuth } from "./context/AuthContext";
import { useEffect, useRef } from "react";
import {Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Prediction from "./pages/Prediction";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import PredictionList from "./components/PredictionList";
import PasswordRecovery from "./pages/PasswordRecovery";
import BrowseClients from "./pages/BrowseClients";
import ConnectionRequests from "./pages/ConnectionRequests";
import DoctorProfile from "./pages/DoctorProfile";
import ChatWidget from "./components/ChatWidget";
import ResetPassword from './pages/ResetPassword';
import "./styles/styles.css";
import toast, { Toaster } from "react-hot-toast";
import AdminPage from "./pages/AdminPage";
import DoctorDashboard from "./pages/DoctorDashboard";


function App() {
  const { user, logout } = useAuth();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        toast.error("Вы были автоматически разлогинены из-за бездействия.");
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

  return (
    <div className="app-container">
      <Navbar />
<Toaster
  position="top-right"
  toastOptions={{
    duration: 3000,
    style: { zIndex: 11000, marginTop: '80px' } // adjust marginTop to navbar height
  }}
/>      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />       
<Route  path="/login" element={   user     ? user.role === "doctor"       ? <Navigate to="/doctor/dashboard" />       : <Navigate to="/dashboard" />     : <Login /> }/>          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/prediction" element={user ? <Prediction /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/doctor/patients/:uin/predictions" element={<PredictionList />} />
          <Route path="/forgot-password" element={<PasswordRecovery />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/clients" element={<BrowseClients />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/connection-requests" element={<ConnectionRequests />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Routes>
      </div>
        <ChatWidget />  {/* ✅ Global Chat Popup */}

    </div>
  );
}

export default App;

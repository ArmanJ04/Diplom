import { useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeartHero from "../components/illustrations/HeartHero";
import { FaRobot, FaChartLine, FaShieldAlt } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext"; // make sure this path is correct
import { useNavigate } from "react-router-dom";

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePredictionClick = () => {
    if (!user) {
      toast.warn("🔒 You must be logged in to use the prediction feature.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      navigate("/prediction");
    }
  };

  return (
    <div className="page-background" style={{ minHeight: "100vh", padding: "60px 20px" }}>
      <ToastContainer />

      {/* Hero Section */}
      <div className="hero-section" style={{ textAlign: "center" }}>
        <HeartHero />
        <h1 className="hero-title">CVD Prediction</h1>
        <h2 className="hero-subtitle">Powered by AI</h2>
        <p className="hero-description">
          Predict cardiovascular disease risks with AI-driven accuracy. Input your health data and receive fast, secure, and personalized predictions.
        </p>

        {/* Remove static alert-box since toast handles alert now */}

        <div className="hero-buttons" style={{ marginTop: 20 }}>
          <button onClick={handlePredictionClick} style={{ marginRight: 12 }}>
            Start Prediction
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section" style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 60 }}>
        <div className="feature-card" style={{ flex: 1, maxWidth: 300, textAlign: "center" }}>
          <FaRobot className="feature-icon" style={{ fontSize: 48, color: "#e63946" }} />
          <h3 className="feature-title">AI-Powered Predictions</h3>
          <p>Leverage advanced algorithms to assess your heart health risk.</p>
        </div>
        <div className="feature-card" style={{ flex: 1, maxWidth: 300, textAlign: "center" }}>
          <FaChartLine className="feature-icon" style={{ fontSize: 48, color: "#457b9d" }} />
          <h3 className="feature-title">Detailed Insights</h3>
          <p>Get a clear breakdown of factors contributing to your prediction.</p>
        </div>
        <div className="feature-card" style={{ flex: 1, maxWidth: 300, textAlign: "center" }}>
          <FaShieldAlt className="feature-icon" style={{ fontSize: 48, color: "#1d3557" }} />
          <h3 className="feature-title">Data Privacy</h3>
          <p>Your health information is secure with end-to-end encryption.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;

import { useEffect, useState } from "react";
import axios from "axios";

function PredictionList({ uin }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/patients/${uin}/predictions`, { withCredentials: true });
        setPredictions(res.data);
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [uin]);

  const handleApprove = async (predictionId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/doctor/patients/${uin}/predictions/${predictionId}/approve`, {}, { withCredentials: true });
      setPredictions(predictions.map(prediction => 
        prediction._id === predictionId ? { ...prediction, status: "approved" } : prediction
      ));
    } catch (error) {
      console.error("Failed to approve prediction:", error);
    }
  };

  const handleCancel = async (predictionId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/doctor/patients/${uin}/predictions/${predictionId}/cancel`, {}, { withCredentials: true });
      setPredictions(predictions.map(prediction => 
        prediction._id === predictionId ? { ...prediction, status: "canceled" } : prediction
      ));
    } catch (error) {
      console.error("Failed to cancel prediction:", error);
    }
  };

  return (
    <div className="container">
      <h2>Prediction History</h2>
      {loading ? (
        <p>Loading predictions...</p>
      ) : (
        <div>
          <ul>
            {predictions.map((prediction) => (
              <li key={prediction._id}>
                <p>Prediction Date: {prediction.date}</p>
                <p>Status: {prediction.status}</p>
                {prediction.status !== "approved" && (
                  <button onClick={() => handleApprove(prediction._id)}>Approve</button>
                )}
                {prediction.status !== "canceled" && (
                  <button onClick={() => handleCancel(prediction._id)}>Cancel</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PredictionList;

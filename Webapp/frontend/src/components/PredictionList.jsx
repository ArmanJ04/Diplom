import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // To get UIN from URL

function PredictionList() {
  const { uin } = useParams(); // Get patient UIN from URL parameter
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackText, setFeedbackText] = useState({}); // Store feedback text per prediction: { predictionId: "text" }
  const [rejectComment, setRejectComment] = useState({}); // Store rejection comment per prediction

  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`http://localhost:5000/api/doctor/patients/${uin}/predictions`, {
        withCredentials: true
      });
      setPredictions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch predictions:", err);
      setError(err.response?.data?.message || "Failed to fetch predictions.");
      setPredictions([]); // Clear predictions on error
    } finally {
      setLoading(false);
    }
  }, [uin]);

  useEffect(() => {
    if (uin) {
      fetchPredictions();
    } else {
      setError("Patient UIN not found in URL.");
      setLoading(false);
    }
  }, [uin, fetchPredictions]);

  const handleAction = async (actionType, predictionId, comment = "") => {
    let url = `http://localhost:5000/api/doctor/patients/${uin}/predictions/${predictionId}`;
    let payload = {};
    let method = 'put';

    switch (actionType) {
      case 'validate':
        url += '/validate';
        if (comment) payload.comment = comment; // Optionally allow comment with validation
        break;
      case 'reject':
        url += '/reject';
        if (!comment) {
          window.alert("A comment is required to mark for revision/reject.");
          return;
        }
        payload.comment = comment;
        break;
      case 'feedback':
        url += '/feedback';
        if (!comment) {
          window.alert("Feedback text cannot be empty.");
          return;
        }
        payload.comment = comment;
        method = 'post';
        break;
      default:
        console.error("Unknown action type");
        return;
    }

    try {
      setLoading(true); // Indicate an action is in progress
      const res = await axios[method](url, payload, { withCredentials: true });
      window.alert(res.data.message || `${actionType} action successful!`);
      fetchPredictions(); // Re-fetch predictions to show updated status/comment
      if (actionType === 'feedback') {
        setFeedbackText(prev => ({ ...prev, [predictionId]: "" })); // Clear feedback input
      }
      if (actionType === 'reject') {
        setRejectComment(prev => ({ ...prev, [predictionId]: "" })); // Clear reject comment input
      }
    } catch (err) {
      console.error(`Failed to ${actionType} prediction:`, err);
      window.alert(err.response?.data?.message || `Failed to ${actionType} prediction.`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFeedbackChange = (predictionId, text) => {
    setFeedbackText(prev => ({ ...prev, [predictionId]: text }));
  };

  const handleRejectCommentChange = (predictionId, text) => {
    setRejectComment(prev => ({ ...prev, [predictionId]: text }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': return 'text-yellow-600 bg-yellow-100';
      case 'doctor_validated': return 'text-green-600 bg-green-100';
      case 'doctor_needs_revision': return 'text-red-600 bg-red-100';
      case 'doctor_commented': return 'text-blue-600 bg-blue-100';
      case 'client_acknowledged': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  if (loading && predictions.length === 0) { // Show main loading only if no predictions are yet displayed
    return <div className="container p-6 text-center"><p>Loading predictions...</p></div>;
  }

  if (error) {
    return <div className="container p-6 text-center"><p className="text-red-500">Error: {error}</p></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
      >
        &larr; Back to Patients
      </button>
      <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-6">
        Prediction History for Patient UIN: {uin}
      </h2>

      {predictions.length === 0 && !loading ? (
        <p className="text-center text-gray-600">No predictions found for this patient.</p>
      ) : (
        <ul className="space-y-6">
          {predictions.map((p) => (
            <li key={p._id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><strong>Prediction Date:</strong> {formatTimestamp(p.createdAt)}</div>
                <div><strong>Raw Result:</strong> {(p.predictionResultRaw * 100).toFixed(2)}% Risk</div>
                <div><strong>Confidence:</strong> {p.confidenceScore !== undefined ? (p.confidenceScore * 100).toFixed(2) + '%' : 'N/A'}</div>
                <div className={`px-2 py-1 rounded-full text-sm inline-block font-medium ${getStatusColor(p.status)}`}>
                  <strong>Status:</strong> {p.status.replace('_', ' ').toUpperCase()}
                </div>
                {p.recommendationAI && <div className="md:col-span-2"><strong>AI Recommendation:</strong> {p.recommendationAI}</div>}
                {p.doctorComment && <div className="md:col-span-2"><strong>Doctor's Comment:</strong> {p.doctorComment}</div>}
                {p.doctorId && p.doctorActionTimestamp && (
                  <div className="md:col-span-2 text-sm text-gray-500">
                    Last action by Dr. {p.doctorId?.firstName} {p.doctorId?.lastName} on {formatTimestamp(p.doctorActionTimestamp)}
                  </div>
                )}
              </div>
              
              <div className="mt-4 space-y-3">
                {/* Validate Action */}
                {p.status !== 'doctor_validated' && (
                  <div className="flex items-center space-x-2">
                     <button
                      onClick={() => handleAction('validate', p._id, feedbackText[p._id] || "")}
                      disabled={loading}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 transition text-sm"
                    >
                      Validate
                    </button>
                    {/* Optional comment with validation */}
                    {/* <input 
                        type="text"
                        placeholder="Optional comment for validation"
                        value={feedbackText[p._id] || ""}
                        onChange={(e) => handleFeedbackChange(p._id, e.target.value)}
                        className="border p-1.5 rounded-md flex-grow text-sm"
                        disabled={loading}
                    /> */}
                  </div>
                )}

                {/* Reject Action */}
                {p.status !== 'doctor_needs_revision' && p.status !== 'doctor_validated' && (
                  <div className="mt-2">
                    <textarea
                      placeholder="Comment for revision/rejection (required)"
                      value={rejectComment[p._id] || ""}
                      onChange={(e) => handleRejectCommentChange(p._id, e.target.value)}
                      className="w-full border p-2 rounded-md mb-1 text-sm"
                      rows="2"
                      disabled={loading}
                    />
                    <button
                      onClick={() => handleAction('reject', p._id, rejectComment[p._id] || "")}
                      disabled={loading || !(rejectComment[p._id] || "").trim()}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 transition text-sm"
                    >
                      Mark for Revision
                    </button>
                  </div>
                )}
                
                {/* Add/Edit Feedback Action */}
                <div className="mt-2">
                  <textarea
                    placeholder="Add or update general feedback..."
                    value={feedbackText[p._id] || ""}
                    onChange={(e) => handleFeedbackChange(p._id, e.target.value)}
                    className="w-full border p-2 rounded-md mb-1 text-sm"
                    rows="2"
                    disabled={loading}
                  />
                  <button
                    onClick={() => handleAction('feedback', p._id, feedbackText[p._id] || "")}
                    disabled={loading || !(feedbackText[p._id] || "").trim()}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition text-sm"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PredictionList;

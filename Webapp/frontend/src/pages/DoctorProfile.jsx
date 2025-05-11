import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { HeartPulse, Check, X, Pencil } from "lucide-react";

function DoctorProfile() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/doctor/patients", { withCredentials: true });
        setPatients(res.data);
      } catch (err) {
        toast.error("Failed to load patients.");
      }
    };
    fetchPatients();
  }, []);

  const handlePatientSelect = async (uin) => {
    setSelectedPatient(uin);
    try {
      const res = await axios.get(`http://localhost:5000/api/doctor/patients/${uin}/predictions`, { withCredentials: true });
      setPredictions(res.data);
    } catch (err) {
      toast.error("Failed to load predictions.");
    }
  };

  const handleApprove = async (predictionId) => {
    try {
      await axios.put(`http://localhost:5000/api/doctor/patients/${selectedPatient}/predictions/${predictionId}/validate`, {}, { withCredentials: true });
      setPredictions(predictions.map(p => p._id === predictionId ? { ...p, status: "approved" } : p));
      toast.success("Prediction approved.");
    } catch (err) {
      toast.error("Approve failed.");
    }
  };

  const handleReject = async (predictionId) => {
    try {
      await axios.put(`http://localhost:5000/api/doctor/patients/${selectedPatient}/predictions/${predictionId}/reject`, {}, { withCredentials: true });
      setPredictions(predictions.map(p => p._id === predictionId ? { ...p, status: "canceled" } : p));
      toast("Prediction cancelled.", { icon: "⚠️" });
    } catch (err) {
      toast.error("Cancel failed.");
    }
  };

  const handleFeedbackChange = (id, text) => {
    setFeedbackMap(prev => ({ ...prev, [id]: text }));
  };

  const handleSendFeedback = async (predictionId) => {
    const text = feedbackMap[predictionId];
    try {
      await axios.post(`http://localhost:5000/api/doctor/patients/${selectedPatient}/predictions/${predictionId}/feedback`, { feedback: text }, { withCredentials: true });
      toast.success("Feedback saved.");
    } catch (err) {
      toast.error("Feedback submission failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">Doctor Dashboard</h1>

      {/* Assigned Clients */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">My Assigned Clients</h2>
        {patients.length === 0 ? (
          <p className="text-gray-600">No assigned clients.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {patients.map((client) => (
              <li
                key={client._id}
                className={`p-4 border rounded-md shadow-sm cursor-pointer hover:bg-blue-50 transition ${
                  selectedPatient === client.uin ? "bg-blue-100 border-blue-500" : "bg-white"
                }`}
                onClick={() => handlePatientSelect(client.uin)}
              >
                <p className="font-semibold">{client.firstName} {client.lastName}</p>
                <p className="text-sm text-gray-500">UIN: {client.uin}</p>
                <p className="text-sm text-gray-500">Email: {client.email}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Prediction History */}
      {selectedPatient && (
        <div>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Predictions for {selectedPatient}</h2>
          {predictions.length === 0 ? (
            <p>No predictions found.</p>
          ) : (
            <ul className="space-y-4">
              {predictions.map((pred) => (
                <li key={pred._id} className="bg-gray-50 p-4 border rounded-md shadow-sm">
                  <p>
                    <HeartPulse className="inline w-5 h-5 text-red-500 mr-1" />
                    <strong>Risk:</strong> {(pred.prediction * 100).toFixed(2)}%
                  </p>
                  <p><strong>Status:</strong> {pred.status}</p>

                  <div className="flex gap-3 mt-2">
                    {pred.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(pred._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {pred.status !== "canceled" && (
                      <button
                        onClick={() => handleReject(pred._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    )}
                  </div>

                  <div className="mt-3">
                    <label className="text-sm text-gray-600">Feedback:</label>
                    <textarea
                      rows={2}
                      value={feedbackMap[pred._id] || ""}
                      onChange={(e) => handleFeedbackChange(pred._id, e.target.value)}
                      className="w-full border p-2 mt-1 rounded-md"
                      placeholder="Write your feedback here..."
                    />
                    <button
                      onClick={() => handleSendFeedback(pred._id)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                    >
                      <Pencil className="inline w-4 h-4 mr-1" /> Save Feedback
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorProfile;

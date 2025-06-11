import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { HeartPulse, Check, X, Pencil } from "lucide-react";
import {EmptyPatients} from "../components/illustrations/EmptyPatients";


function DoctorProfile() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientFullName, setSelectedPatientFullName] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [expandedPrediction, setExpandedPrediction] = useState(null);
  const [approvedOrRejected, setApprovedOrRejected] = useState({});

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/patients`);
        setPatients(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error("Failed to load patients.");
        setPatients([]);
      }
    };
    fetchPatients();
  }, []);

  const handlePatientSelect = async (patient) => {
    if (!patient || !patient.uin) return;
    const uin = patient.uin;
    setSelectedPatient(uin);
    setSelectedPatientFullName(`${patient.firstName} ${patient.lastName}`);
    setPredictions([]);
    setIsLoadingPredictions(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/doctor/patients/${uin}/predictions`
      );
      if (Array.isArray(res.data)) setPredictions(res.data);
      else {
        toast.error("Unexpected data format for predictions.");
        setPredictions([]);
      }
    } catch {
      toast.error("Failed to load predictions.");
      setPredictions([]);
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  const togglePredictionDetails = (predictionId) => {
    setExpandedPrediction(prev => prev === predictionId ? null : predictionId);
  };

  const handleApprove = async (predictionId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/doctor/patients/${selectedPatient}/predictions/${predictionId}/validate`
      );
      setApprovedOrRejected(prev => ({ ...prev, [predictionId]: "approved" }));
      toast.success("Prediction approved.");
    } catch {
      toast.error("Approve failed.");
    }
  };

  const handleReject = async (predictionId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/doctor/patients/${selectedPatient}/predictions/${predictionId}/reject`
      );
      setApprovedOrRejected(prev => ({ ...prev, [predictionId]: "rejected" }));
      toast.success("Prediction rejected.");
    } catch {
      toast.error("Cancel failed.");
    }
  };

  const handleSendFeedback = async (predictionId) => {
    if (!selectedPatient || !feedbackMap[predictionId]) {
      toast.error("No feedback to send.");
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/doctor/patients/${selectedPatient}/predictions/${predictionId}/feedback`,
        { feedback: feedbackMap[predictionId] }
      );
      setPredictions(prev =>
        prev.map(p => p._id === predictionId ? { ...p, feedbackProvided: true } : p)
      );
      toast.success("Feedback sent.");
    } catch {
      toast.error("Feedback failed.");
    }
  };

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">My Patients</h1>

{patients.length === 0 && (
  <>
    <EmptyPatients />
    <p className="text-center text-gray-500">No patients found.</p>
  </>
)}
      <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
        {patients.map(patient => (
          <li
            key={patient._id}
            onClick={() => handlePatientSelect(patient)}
            className={`cursor-pointer p-5 border rounded-lg shadow hover:shadow-lg transition ${
              selectedPatient === patient.uin ? "bg-blue-50 border-blue-300" : "bg-white"
            }`}
          >
            <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
            <p className="text-sm text-gray-600">{patient.email}</p>
            <p className="text-sm text-gray-500">UIN: {patient.uin}</p>
          </li>
        ))}
      </ul>

      {selectedPatient && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Predictions for: <span className="text-blue-600">{selectedPatientFullName}</span> (UIN: {selectedPatient})
          </h2>
          {isLoadingPredictions ? (
            <p>Loading predictions...</p>
          ) : predictions.length === 0 ? (
            <p>No predictions found for this patient.</p>
          ) : (
            <ul className="space-y-6">
              {predictions.map(pred => (
                <li
                  key={pred._id}
                  className="p-6 bg-gray-50 border rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <p
                      className="text-lg cursor-pointer text-blue-600"
                      onClick={() => togglePredictionDetails(pred._id)}
                    >
                      <HeartPulse className="inline w-6 h-6 text-pink-600 mr-2" />
                      Risk Prediction: <span className="font-bold">{(pred.prediction * 100).toFixed(2)}%</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(pred.timestamp || pred.createdAt || Date.now()).toLocaleString()}
                    </p>
                  </div>

                  {expandedPrediction === pred._id && (
                    <div className="bg-gray-100 p-5 rounded-lg mt-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          pred.status === "approved"
                            ? "bg-green-200 text-green-800"
                            : pred.status === "rejected"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {pred.status || "pending"}
                      </span>
                      <h3 className="font-semibold text-gray-700 mb-3 mt-4">Medical Inputs</h3>
                      <ul className="text-sm text-gray-600 space-y-2">
  <li><strong>Birthdate:</strong> {new Date(pred.medicalInputs.birthdate).toLocaleDateString()}</li>
  <li><strong>Gender:</strong> {pred.medicalInputs.gender}</li>
  <li><strong>Height:</strong> {pred.medicalInputs.height} cm</li>
  <li><strong>Weight:</strong> {pred.medicalInputs.weight} kg</li>
  <li><strong>Blood Pressure:</strong> {pred.medicalInputs.bloodPressure}</li>
  <li><strong>Glucose:</strong> {pred.medicalInputs.glucose}</li>
  <li><strong>Smoking:</strong> {pred.medicalInputs.smoking ? "Yes" : "No"}</li>
  <li><strong>Alcohol:</strong> {pred.medicalInputs.alcohol ? "Yes" : "No"}</li>
  <li><strong>Physical Activity:</strong> {pred.medicalInputs.physicalActivity}</li>
</ul>
                      <div className="flex gap-4 mt-4 flex-wrap">
                        {pred.status !== "approved" && (
                          <button 
                            onClick={() => handleApprove(pred._id)}
                            disabled={pred.status === "rejected"}
                            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                           data-tip="Approve this prediction.">
                            <Check className="w-5 h-5" /> Approve
                          </button>
                        )}
                        {pred.status !== "rejected" && (
                          <button 
                            onClick={() => handleReject(pred._id)}
                            disabled={pred.status === "approved"}
                            className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
                          data-tip="Reject this prediction.">
                            <X className="w-5 h-5" /> Reject
                          </button>
                        )}
                      </div>

                      <textarea   

                        value={feedbackMap[pred._id] || pred.feedback || ""}
                        onChange={e => setFeedbackMap({ ...feedbackMap, [pred._id]: e.target.value })}
                        placeholder="Provide feedback to the patient..."
                        className="w-full mt-4 p-3 border rounded-lg text-sm"
                        rows={3}
                      data-tip="Write feedback or notes for the patient." />
                      <button
                        onClick={() => handleSendFeedback(pred._id)}
                        disabled={!feedbackMap[pred._id] && !pred.feedback}
                        className="mt-3 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 text-sm"
                      data-tip="Submit your feedback to the patient." >
                        <Pencil className="w-4 h-4" /> Send/Update Feedback
                      </button>
                    </div>
                  )}
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

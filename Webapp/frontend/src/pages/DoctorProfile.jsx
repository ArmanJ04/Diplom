import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { HeartPulse, Check, X, Pencil } from "lucide-react";

function DoctorProfile() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null); // Stores the selected patient's UIN
  const [selectedPatientFullName, setSelectedPatientFullName] = useState(""); // For display
  const [predictions, setPredictions] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);

  // Debug log to see initial state and updates
  // console.log("DoctorProfile state: patients:", patients.length, "selectedPatient:", selectedPatient, "predictions:", predictions.length);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Assuming AuthContext's Axios interceptor adds the auth token
        const res = await axios.get("http://localhost:5000/api/doctor/patients");
        // Ensure patients is always an array
        setPatients(Array.isArray(res.data) ? res.data : []);
        if (!Array.isArray(res.data)) {
          console.warn("Fetched patients data is not an array:", res.data);
        }
      } catch (err) {
        toast.error("Failed to load patients.");
        console.error("Error fetching patients:", err.response?.data?.message || err.message);
        setPatients([]); // Ensure it's an empty array on error
      }
    };
    fetchPatients();
  }, []);

  const handlePatientSelect = async (patient) => {
    if (!patient || !patient.uin) {
      console.error("Invalid patient object passed to handlePatientSelect:", patient);
      return;
    }
    const uin = patient.uin;
    setSelectedPatient(uin);
    setSelectedPatientFullName(`${patient.firstName} ${patient.lastName}`); // Store full name for display
    setPredictions([]); // Clear previous patient's predictions immediately
    setIsLoadingPredictions(true); // Set loading state for predictions

    console.log(`Workspaceing predictions for UIN: ${uin}`);

    try {
      // Assuming AuthContext's Axios interceptor adds the auth token
      const res = await axios.get(
        `http://localhost:5000/api/doctor/patients/${uin}/predictions`
      );

      console.log(`API Response for predictions (UIN: ${uin}):`, res);
      console.log(`Data received for predictions (UIN: ${uin}):`, res.data);

      // CRITICAL: Ensure predictions is always an array
      if (Array.isArray(res.data)) {
        setPredictions(res.data);
        if (res.data.length === 0) {
          // toast.success(`No predictions found for ${selectedPatientFullName}.`); // Optional: inform if empty
        }
      } else {
        console.warn(`Predictions data for UIN ${uin} is not an array:`, res.data);
        toast.error(`Received unexpected data format for predictions for ${selectedPatientFullName}.`);
        setPredictions([]); // Set to empty array if not an array
      }
    } catch (err) {
      console.error(`Error loading predictions for UIN ${uin}:`, err.response || err.message);
      toast.error(`Failed to load predictions for ${selectedPatientFullName}.`);
      setPredictions([]); // Ensure it's an empty array on error
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  const handleApprove = async (predictionId) => {
    if (!selectedPatient) return;
    try {
      await axios.put(
        `http://localhost:5000/api/doctor/patients/${selectedPatient}/predictions/${predictionId}/validate`
      );
      setPredictions((prev) =>
        prev.map((p) =>
          p._id === predictionId ? { ...p, status: "approved" } : p
        )
      );
      toast.success("Prediction approved.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Approve failed.");
      console.error("Approve failed:", err.response || err.message);
    }
  };

  const handleReject = async (predictionId) => {
    if (!selectedPatient) return;
    try {
      await axios.put(
        `http://localhost:5000/api/doctor/patients/${selectedPatient}/predictions/${predictionId}/reject`
      );
      setPredictions((prev) =>
        prev.map((p) =>
          p._id === predictionId ? { ...p, status: "canceled" } : p
        )
      );
      toast.success("Prediction rejected.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed.");
      console.error("Cancel failed:", err.response || err.message);
    }
  };

  const handleSendFeedback = async (predictionId) => {
    if (!selectedPatient || !feedbackMap[predictionId]) {
        toast.error("No feedback to send or patient not selected.");
        return;
    };
    try {
      await axios.post(
        `http://localhost:5000/api/doctor/patients/${selectedPatient}/predictions/${predictionId}/feedback`,
        { feedback: feedbackMap[predictionId] }
      );
      // Optionally update prediction status or feedback in local state if backend confirms
      setPredictions(prev => prev.map(p => p._id === predictionId ? {...p, feedbackProvided: true /* or update p.feedback if your model has it */} : p));
      toast.success("Feedback sent.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Feedback failed.");
      console.error("Feedback failed:", err.response || err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">My Patients</h1>

      {patients.length === 0 && <p>No patients found.</p>}

      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6">
        {patients.map((patient) => (
          <li
            key={patient._id}
            onClick={() => handlePatientSelect(patient)} // Pass the whole patient object
            className={`cursor-pointer p-4 border rounded-md shadow hover:shadow-lg transition-shadow ${
              selectedPatient === patient.uin ? "bg-blue-100 border-blue-300" : "bg-white"
            }`}
          >
            <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
            <p className="text-sm text-gray-600">{patient.email}</p>
            <p className="text-sm text-gray-500">UIN: {patient.uin}</p>
          </li>
        ))}
      </ul>

      {selectedPatient && (
        <div className="mt-8 pt-6 border-t">
          <h2 className="text-2xl font-semibold mb-4">
            Predictions for: <span className="text-blue-600">{selectedPatientFullName}</span> (UIN: {selectedPatient})
          </h2>
          {isLoadingPredictions ? (
            <p>Loading predictions...</p>
          ) : predictions.length === 0 ? (
            <p>No predictions found for this patient.</p>
          ) : (
            <ul className="space-y-4">
              {predictions.map((pred) => (
                <li key={pred._id} className="p-4 bg-gray-50 border rounded-md shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-lg">
                      <HeartPulse className="inline w-5 h-5 text-pink-600 mr-2" />
                      Risk Prediction: <span className="font-bold">{(pred.prediction * 100).toFixed(2)}%</span>
                    </p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        pred.status === "approved" ? "bg-green-200 text-green-800" :
                        pred.status === "canceled" ? "bg-red-200 text-red-800" :
                        "bg-yellow-200 text-yellow-800"
                    }`}>
                        {pred.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Date: {new Date(pred.timestamp || pred.createdAt || Date.now()).toLocaleString()}
                  </p>


                  <div className="flex gap-3 mt-2 mb-3 flex-wrap">
                    {pred.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(pred._id)}
                        disabled={pred.status === "canceled"}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-400"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {pred.status !== "canceled" && (
                      <button
                        onClick={() => handleReject(pred._id)}
                        disabled={pred.status === "approved"}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-gray-400"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    )}
                  </div>

                  <textarea
                    value={feedbackMap[pred._id] || pred.feedback || ""} // Also display existing feedback if available
                    onChange={(e) => setFeedbackMap({ ...feedbackMap, [pred._id]: e.target.value })}
                    placeholder="Provide feedback to the patient..."
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    rows="2"
                  />
                  <button
                    onClick={() => handleSendFeedback(pred._id)}
                    disabled={!feedbackMap[pred._id] && !pred.feedback} // Disable if no new feedback and no existing feedback to resend
                    className="mt-2 flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm disabled:bg-gray-400"
                  >
                    <Pencil className="w-3 h-3" /> Send/Update Feedback
                  </button>
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
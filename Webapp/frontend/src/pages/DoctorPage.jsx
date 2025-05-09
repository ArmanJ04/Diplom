import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate }
from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Assuming AuthContext provides the logged-in user

function DoctorPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get the logged-in user (doctor)

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user || user.role !== 'doctor') {
        setError("Access denied. You must be logged in as a doctor.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        // The backend route /api/doctor/patients is protected and uses the logged-in doctor's ID
        const res = await axios.get("http://localhost:5000/api/doctor/patients", {
          withCredentials: true // Important for sending HttpOnly auth cookies
        });
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        setError(err.response?.data?.message || "Failed to fetch patients. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]); // Re-fetch if the user object changes

  const handleViewPredictions = (patientUin) => {
    // Navigate to the prediction list for the selected patient, passing their UIN
    navigate(`/doctor/patients/${patientUin}/predictions`);
  };

  if (loading) {
    return <div className="container p-6 text-center"><p className="text-lg text-gray-600">Loading patients...</p></div>;
  }

  if (error) {
    return <div className="container p-6 text-center"><p className="text-lg text-red-600">Error: {error}</p></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl sm:text-3xl font-semibold text-primary text-center mb-6">Doctor Dashboard</h2>
      
      {patients.length === 0 ? (
        <p className="text-lg text-gray-600 text-center">No patients are currently assigned to you.</p>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Assigned Patients</h3>
          <ul className="space-y-4">
            {patients.map((patient) => (
              <li 
                key={patient._id} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="text-lg font-medium text-gray-800">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-sm text-gray-500">UIN: {patient.uin}</p>
                </div>
                <button
                  onClick={() => handleViewPredictions(patient.uin)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  View Predictions
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DoctorPage;

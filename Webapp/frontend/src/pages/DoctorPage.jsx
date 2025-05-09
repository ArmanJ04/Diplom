import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DoctorPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/doctor/patients", { withCredentials: true });
        setPatients(res.data);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleViewPredictions = (uin) => {
    navigate(`/doctor/patients/${uin}/predictions`);
  };

  return (
    <div className="container p-6 space-y-6">
      <h2 className="text-3xl font-semibold text-primary">Doctor Dashboard</h2>
      {loading ? (
        <p className="text-lg text-gray-600">Loading patients...</p>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-700">Patients</h3>
          <ul className="space-y-4">
            {patients.map((patient) => (
              <li key={patient._id} className="flex justify-between items-center p-4 bg-gray-100 rounded-md shadow-sm">
                <p className="text-lg font-medium">{patient.firstName} {patient.lastName} ({patient.uin})</p>
                <button
                  onClick={() => handleViewPredictions(patient.uin)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
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

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
    <div className="container">
      <h2>Doctor Dashboard</h2>
      {loading ? (
        <p>Loading patients...</p>
      ) : (
        <div>
          <h3>Patients</h3>
          <ul>
            {patients.map((patient) => (
              <li key={patient._id}>
                <p>{patient.firstName} {patient.lastName} ({patient.uin})</p>
                <button onClick={() => handleViewPredictions(patient.uin)}>View Predictions</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DoctorPage;

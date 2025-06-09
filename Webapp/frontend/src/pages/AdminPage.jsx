import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, User2, Trash2, Stethoscope, User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function AdminPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    patients: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientPredictions, setPatientPredictions] = useState([]);
  const [loadingPatientPreds, setLoadingPatientPreds] = useState(false);
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdminLoggedIn");
    if (!isAdmin) navigate("/login");
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers }),
      ]);
      setStats(statsRes.data);
      const allUsers = usersRes.data;
      setDoctors(allUsers.filter((u) => u.role === "doctor" && u.doctorApproved));
      setPatients(allUsers.filter((u) => u.role === "patient"));
    } catch {
      setStats({ users: 0, doctors: 0, patients: 0, pending: 0, approved: 0, rejected: 0 });
      setDoctors([]);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/pending-doctors`, { headers });
      setPendingDoctors(res.data);
    } catch {
      setPendingDoctors([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPendingDoctors();
  }, []);

  const approveDoctor = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/approve-doctor/${id}`, {}, { headers });
      await fetchPendingDoctors();
      await fetchData();
    } catch (err) {
      console.error("Failed to approve doctor", err);
    }
  };

  const rejectDoctor = async (id) => {
    if (!window.confirm("Reject and remove this doctor?")) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/reject-doctor/${id}`, { headers });
      await fetchPendingDoctors();
    } catch (err) {
      console.error("Failed to reject doctor", err);
    }
  };

  const openPatientPredictions = async (patientId) => {
    setSelectedPatientId(patientId);
    setLoadingPatientPreds(true);
    setExpandedIds([]);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/predictions?clientId=${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatientPredictions(res.data);
    } catch {
      setPatientPredictions([]);
    } finally {
      setLoadingPatientPreds(false);
    }
  };

  const closePatientPredictions = () => {
    setSelectedPatientId(null);
    setPatientPredictions([]);
    setExpandedIds([]);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      await fetchPendingDoctors();
    } catch {}
  };

  const toggleExpanded = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const chartData = [
    { name: "Users", value: stats.users },
    { name: "Doctors", value: stats.doctors },
    { name: "Patients", value: stats.patients },
    { name: "Pending", value: stats.pending },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
  ];

  const filteredDoctors = doctors.filter((d) =>
    `${d.firstName} ${d.lastName} ${d.email}`.toLowerCase().includes(filterText.toLowerCase())
  );
  const filteredPatients = patients.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(filterText.toLowerCase())
  );

  const getColor = (p) => {
    const percent = parseFloat(p) * 100;
    if (percent < 30) return "text-green-600";
    if (percent < 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow mt-10">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6" /> Admin Panel
        </h1>
      </header>

      <section className="mb-10 bg-slate-100 p-6 rounded-lg shadow-inner">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart className="w-5 h-5 text-blue-600" /> Platform Statistics
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-red-600 mb-4 flex items-center gap-2">
          Pending Doctor Approvals ({pendingDoctors.length})
        </h2>
        {pendingDoctors.length === 0 ? (
          <p className="text-gray-500">No pending doctors.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded border border-gray-200 shadow-sm">
            {pendingDoctors.map((doc) => (
              <li
                key={doc._id}
                className="flex justify-between items-center p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold">Dr. {doc.firstName} {doc.lastName}</p>
                  <p className="text-sm text-gray-600">{doc.email}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => approveDoctor(doc._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectDoctor(doc._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
          <User2 className="w-6 h-6" />
          Approved Doctors ({filteredDoctors.length})
        </h2>
        {filteredDoctors.length === 0 ? (
          <p className="text-gray-500">No doctors found.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded border border-gray-200 shadow-sm">
            {filteredDoctors.map((doc) => (
              <li
                key={doc._id}
                className="flex justify-between items-center p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold">
                    Dr. {doc.firstName} {doc.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{doc.email}</p>
                </div>
                <button
                  onClick={() => deleteUser(doc._id)}
                  aria-label={`Delete doctor ${doc.firstName} ${doc.lastName}`}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
          <User className="w-6 h-6" />
          Registered Patients ({filteredPatients.length})
        </h2>
        {filteredPatients.length === 0 ? (
          <p className="text-gray-500">No patients found.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded border border-gray-200 shadow-sm">
            {filteredPatients.map((pat) => (
              <li
                key={pat._id}
                className="flex justify-between items-center p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold">
                    <button
                      onClick={() => openPatientPredictions(pat._id)}
                      className="text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
                      aria-label={`Show predictions for ${pat.firstName} ${pat.lastName}`}
                    >
                      {pat.firstName} {pat.lastName}
                    </button>
                  </p>
                  <p className="text-sm text-gray-600">{pat.email}</p>
                </div>
                <button
                  onClick={() => deleteUser(pat._id)}
                  aria-label={`Delete patient ${pat.firstName} ${pat.lastName}`}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedPatientId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closePatientPredictions}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePatientPredictions}
              aria-label="Close patient predictions"
              className="mb-6 text-red-600 hover:text-red-800 font-semibold text-lg"
            >
              Close ×
            </button>

            <h3 className="text-2xl font-bold mb-6">
              Predictions history for patient:{" "}
              {patients.find((p) => p._id === selectedPatientId)
                ? `${patients.find((p) => p._id === selectedPatientId).firstName} ${patients.find((p) => p._id === selectedPatientId).lastName}`
                : selectedPatientId}
            </h3>

            {loadingPatientPreds ? (
              <p>Loading...</p>
            ) : patientPredictions.length === 0 ? (
              <p>No predictions found for this patient.</p>
            ) : (
              <ul className="space-y-4">
                {patientPredictions.map((pred, idx) => {
                  const id = pred._id || idx;
                  const riskPercent = (pred.prediction * 100).toFixed(2);
                  const riskColor =
                    riskPercent < 30
                      ? "text-green-600"
                      : riskPercent < 70
                      ? "text-yellow-600"
                      : "text-red-600";
                  const isExpanded = expandedIds.includes(id);

                  const dateStr = pred.createdAt || pred.timestamp || null;
                  const dateFormatted = dateStr ? new Date(dateStr).toLocaleString() : "N/A";

                  return (
                    <li
                      key={id}
                      className="bg-gray-50 rounded-xl shadow-md p-5 cursor-pointer select-none"
                    >
                      <div
                        onClick={() => toggleExpanded(id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") toggleExpanded(id);
                        }}
                        tabIndex={0}
                        role="button"
                        aria-expanded={isExpanded}
                        aria-controls={`prediction-details-${id}`}
                        className="flex justify-between items-center font-semibold"
                      >
                        <span className="flex items-center gap-2">
                          <Stethoscope className="inline w-6 h-6 text-pink-600" />
                          Risk Score:{" "}
                          <span className={`${riskColor} font-bold`}>{riskPercent}%</span>
                        </span>
                        <span className="text-xl font-bold">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                      <div
                        id={`prediction-details-${id}`}
                        className={`collapse-content mt-3 text-gray-700 text-sm ${
                          isExpanded ? "open" : ""
                        }`}
                      >
                        <p>
                          <strong>Date:</strong> {dateFormatted}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          {pred.status
                            ? pred.status.charAt(0).toUpperCase() + pred.status.slice(1)
                            : "N/A"}
                        </p>
                        {pred.feedback && (
                          <p>
                            <strong>Doctor's Feedback:</strong> {pred.feedback}
                          </p>
                        )}
                        {pred.medicalInputs && (
                          <>
                            <p className="mt-2 font-semibold">Medical Inputs:</p>
                            <ul className="list-disc list-inside ml-5">
                              {Object.entries(pred.medicalInputs).map(([key, value]) => (
                                <li key={key}>
                                  <strong>{key}:</strong> {String(value)}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;

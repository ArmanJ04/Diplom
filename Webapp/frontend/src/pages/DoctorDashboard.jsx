import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [patients, setPatients] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [predictionSummaries, setPredictionSummaries] = useState({});

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      navigate("/login");
    } else {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data.stats || {});
      setPatients(data.patients || []);
    } catch (err) {
      console.error("Failed to fetch doctor dashboard data:", err);
    }
  };

  const handleExpand = async (uin, index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
      if (!predictionSummaries[uin]) {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/doctor/patients/${uin}/prediction-summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setPredictionSummaries(prev => ({ ...prev, [uin]: data }));
        } catch (err) {
          console.error("Failed to fetch prediction summary:", err);
        }
      }
    }
  };

  const chartData = [
    { name: "Patients", value: stats.patientCount || 0 },
    { name: "Pending", value: stats.pendingPredictions || 0 },
    { name: "Approved", value: stats.approvedPredictions || 0 },
  ];

  return (
    <div className="page-container p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-800 mb-2">Welcome, Dr. {user?.lastName}</h1>
      <p className="text-gray-700 text-lg mb-8">This is your personalized dashboard.</p>

      {/* Overview Chart */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">📊 General Overview</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Glossary / Explanation */}
      <section className="mb-10 bg-blue-50 p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold text-blue-700 mb-2">📘 Status Definitions</h3>
        <ul className="text-gray-700 text-lg list-disc list-inside">
          <li><strong>Pending:</strong> Predictions waiting for your feedback.</li>
          <li><strong>Approved:</strong> Reviewed predictions that have been confirmed.</li>
        </ul>
      </section>

      {/* Patient List */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">🧑‍🤝‍🧑 Assigned Patients</h2>
        {patients.length === 0 ? (
          <p className="text-gray-600">No patients assigned yet.</p>
        ) : (
          <ul className="space-y-4">
            {patients.map((p, i) => {
              const isExpanded = expandedIndex === i;
              const summary = predictionSummaries[p.uin] || {};
              return (
                <li
                  key={i}
                  className={`p-4 bg-white rounded-lg shadow-sm border transition-all duration-300 
                            ${isExpanded ? "bg-gray-50" : "hover:bg-gray-100"} cursor-pointer`}
                  onClick={() => handleExpand(p.uin, i)}
                  title="Click to view patient details"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-blue-700 text-lg flex items-center gap-2">
                      👤 {p.firstName} {p.lastName}
                      <span className="text-base text-gray-400">{isExpanded ? "▲" : "▼"}</span>
                    </p>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 text-gray-700 text-sm pl-1 space-y-1">
                      <p>📧 <strong>Email:</strong> {p.email}</p>
                      <p>🆔 <strong>UIN:</strong> {p.uin}</p>
                      <div className="mt-2">
                        <p className="font-semibold text-blue-800">📊 Prediction Summary:</p>
                        <ul className="ml-4 list-disc">
                          <li>Pending: {summary.pending || 0}</li>
                          <li>Approved: {summary.approved || 0}</li>
                          <li>Canceled: {summary.canceled || 0}</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Tips */}
      <section className="mb-10 bg-green-50 p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold text-green-700 mb-2">🧠 Doctor Tips</h3>
        <ul className="text-gray-700 text-lg list-disc list-inside">
          <li>Review pending predictions daily.</li>
          <li>Give clear feedback to help patient education.</li>
          <li>Maintain consistent patient communication via chat.</li>
        </ul>
      </section>
    </div>
  );
}

export default DoctorDashboard;

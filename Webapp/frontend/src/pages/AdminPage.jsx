// AdminPage.jsx — с JWT, фильтром, графиками и подтверждением
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, User2, CheckCircle2, XCircle, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function AdminPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [stats, setStats] = useState({ users: 0, doctors: 0, pending: 0 });

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdminLoggedIn");
    if (!isAdmin) navigate("/login");
  }, [navigate]);

  const fetchPendingDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/pending-doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  const approveDoctor = async (id) => {
    const confirm = window.confirm("Are you sure you want to approve this doctor?");
    if (!confirm) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/admin/approve-doctor/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPendingDoctors();
      fetchStatistics();
    } catch (err) {
      console.error("Error approving doctor", err);
    }
  };

  const rejectDoctor = async (id) => {
    const confirm = window.confirm("Reject and remove this doctor from pending list?");
    if (!confirm) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/reject-doctor/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPendingDoctors();
      fetchStatistics();
    } catch (err) {
      console.error("Error rejecting doctor", err);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
    fetchStatistics();
  }, []);

  const filteredDoctors = doctors.filter(doc =>
    `${doc.firstName} ${doc.lastName} ${doc.email}`
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );

  const chartData = [
    { name: "Users", value: stats.users },
    { name: "Doctors", value: stats.doctors },
    { name: "Pending", value: stats.pending },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" /> Admin Panel
        </h1>
      </div>

      {/* Chart Section */}
      <div className="mb-6 bg-slate-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-600" /> Platform Stats
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filter */}
      <input
        type="text"
        placeholder="Search by name or email"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mb-4 w-full border px-4 py-2 rounded"
      />

      {/* List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading doctors...</p>
      ) : filteredDoctors.length === 0 ? (
        <p className="text-center text-gray-500">No doctors pending approval.</p>
      ) : (
        <ul className="space-y-4">
          {filteredDoctors.map((doc) => (
            <li key={doc._id} className="flex justify-between items-center bg-slate-100 p-4 rounded-lg shadow-sm">
              <div>
                <p className="font-semibold text-lg flex items-center gap-2">
                  <User2 className="w-5 h-5 text-blue-600" />
                  {doc.firstName} {doc.lastName}
                </p>
                <p className="text-sm text-gray-600">Email: {doc.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => approveDoctor(doc._id)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => rejectDoctor(doc._id)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminPage;

// AdminPage.jsx — просмотр всех пользователей, докторов и предсказаний с действиями и фильтрами
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShieldCheck, User2, CheckCircle2, XCircle, BarChart2, Trash2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

function AdminPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [stats, setStats] = useState({ users: 0, doctors: 0, patients: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdminLoggedIn");
    if (!isAdmin) navigate("/login");
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, doctorsRes, predictionsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats", { headers }),
        axios.get("http://localhost:5000/api/admin/users", { headers }),
        axios.get("http://localhost:5000/api/admin/doctors", { headers }),
        axios.get("http://localhost:5000/api/admin/predictions", { headers })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDoctors(doctorsRes.data);
      setPredictions(predictionsRes.data);
    } catch (err) {
      console.error("Error fetching admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    const confirm = window.confirm("Delete this user permanently?");
    if (!confirm) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = [
    { name: "Users", value: stats.users },
    { name: "Doctors", value: stats.doctors },
    { name: "Patients", value: stats.patients },
    { name: "Pending", value: stats.pending },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
  ];

  const filteredUsers = users.filter(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(filterText.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
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
        placeholder="Search users by name or email"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mb-4 w-full border px-4 py-2 rounded"
      />

      {/* Users */}
      <h2 className="text-xl font-bold text-blue-700 mb-2">All Users</h2>
      <ul className="space-y-2 mb-6">
        {filteredUsers.map((u) => (
          <li key={u._id} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
            <div>
              <p className="font-semibold">{u.firstName} {u.lastName}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>
            <button
              onClick={() => deleteUser(u._id)}
              className="text-sm text-red-600 hover:underline"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>

      {/* Doctors */}
      <h2 className="text-xl font-bold text-blue-700 mb-2">Approved Doctors</h2>
      <ul className="space-y-2 mb-6">
        {doctors.map((d) => (
          <li key={d._id} className="flex justify-between items-center bg-green-50 p-3 rounded-md">
            <div>
              <p className="font-semibold">Dr. {d.firstName} {d.lastName}</p>
              <p className="text-sm text-gray-500">{d.email}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Predictions */}
      <h2 className="text-xl font-bold text-blue-700 mb-2">Predictions</h2>
      <div className="overflow-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Patient</th>
              <th className="p-2 text-left">Doctor</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-2">{p.patientName}</td>
                <td className="p-2">{p.doctorName || "-"}</td>
                <td className="p-2 text-blue-600 font-semibold">{p.status}</td>
                <td className="p-2">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;

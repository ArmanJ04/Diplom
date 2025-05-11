// Redesigned AdminPage.jsx (Doctor Approval Panel)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ShieldCheck, User2, CheckCircle2 } from "lucide-react";

function AdminPage() {
  const [doctors, setDoctors] = useState([]);

  const fetchPendingDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/pending-doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors", err);
    }
  };

  const approveDoctor = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/approve-doctor/${id}`);
      fetchPendingDoctors();
    } catch (err) {
      console.error("Error approving doctor", err);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
        <ShieldCheck className="w-6 h-6" /> Admin Panel: Approve Doctors
      </h1>

      {doctors.length === 0 ? (
        <p className="text-center text-gray-500">No doctors pending approval.</p>
      ) : (
        <ul className="space-y-4">
          {doctors.map((doc) => (
            <li key={doc._id} className="flex justify-between items-center bg-slate-100 p-4 rounded-lg shadow-sm">
              <div>
                <p className="font-semibold text-lg flex items-center gap-2">
                  <User2 className="w-5 h-5 text-blue-600" />
                  {doc.firstName} {doc.lastName}
                </p>
                <p className="text-sm text-gray-600">Email: {doc.email}</p>
              </div>
              <button
                onClick={() => approveDoctor(doc._id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminPage;

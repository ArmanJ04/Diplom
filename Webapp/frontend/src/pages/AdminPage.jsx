import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminPage() {
  const [doctors, setDoctors] = useState([]);

  const fetchPendingDoctors = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/pending-doctors");
    setDoctors(res.data);
  };

  const approveDoctor = async (id) => {
    await axios.post(`http://localhost:5000/api/admin/approve-doctor/${id}`);
    fetchPendingDoctors();
  };

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  return (
    <div>
      <h2>Pending Doctors</h2>
      <ul>
        {doctors.map((doc) => (
          <li key={doc._id}>
            {doc.firstName} {doc.lastName} — {doc.email}
            <button onClick={() => approveDoctor(doc._id)}>Approve</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPage;

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { EmptyRequests } from "../components/illustrations/EmptyRequests";
import { UserPlus, CheckCircle2 } from "lucide-react";

function ConnectionRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = async () => {
    try {
      const [pendingRes, acceptedRes] = await Promise.all([
axios.get(`${import.meta.env.VITE_API_URL}/api/client/connection-requests`, { withCredentials: true }),
axios.get(`${import.meta.env.VITE_API_URL}/api/client/prediction/accepted-connections`, { withCredentials: true }),

      ]);
      setPendingRequests(pendingRes.data);
      setAcceptedRequests(acceptedRes.data);
    } catch {
      toast.error("Failed to load connection requests");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/browse-doctors`, {
        withCredentials: true,
      });
      setDoctors(res.data || []);
    } catch {
      toast.error("Failed to load doctors");
    }
  };

  const fetchSentDoctorRequests = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/sent-requests`, {
        withCredentials: true,
      });
      setSentRequests(res.data.map(r => r.doctorId));
    } catch {
      setSentRequests([]);
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/prediction/respond-request/${requestId}`,
        { action },
        { withCredentials: true }
      );
      toast.success(`Request ${action}ed successfully`);
      fetchRequests();
    } catch {
      toast.error("Failed to respond to request");
    }
  };

  const handleDisconnect = async (requestId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/prediction/disconnect-request/${requestId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Disconnected successfully");
      fetchRequests();
    } catch {
      toast.error("Failed to disconnect");
    }
  };

const handleConnect = async (doctorId) => {
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/client/request-connection/${doctorId}`, {}, {
      withCredentials: true,
    });
    toast.success("Request sent to doctor");
    fetchSentDoctorRequests(); // refresh
  } catch {
    toast.error("Failed to send request");
  }
};


useEffect(() => {
  fetchRequests();
  fetchDoctors();
  fetchSentDoctorRequests();
}, []);


const excludedDoctorIds = new Set([
  ...acceptedRequests.map(r => r.doctorId?._id ?? r.doctorId),
  ...pendingRequests.map(r => r.doctorId?._id ?? r.doctorId),
  ...sentRequests.map(id => id?._id ?? id)
].filter(Boolean).map(id => id.toString())); // 🔥 fix: ensure strings

const filteredDoctors = doctors
  .filter(doc =>
    `${doc.firstName} ${doc.lastName} ${doc.uin}`.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .filter(doc => !excludedDoctorIds.has(doc._id.toString())); // 🔥 fix: string match

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Doctor Connection Requests</h1>

      {pendingRequests.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
          <ul className="space-y-6 mb-10">
            {pendingRequests.map(req => (
              <li key={req._id} className="bg-white border p-6 rounded-lg shadow">
                <p><strong>Doctor:</strong> {req.doctorId.firstName} {req.doctorId.lastName}</p>
                <p><strong>Email:</strong> {req.doctorId.email}</p>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleRespond(req._id, "accept")}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(req._id, "reject")}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {acceptedRequests.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Connected Doctors</h2>
          <ul className="space-y-6 mb-10">
            {acceptedRequests.map(req => (
              <li key={req._id} className="bg-white border p-6 rounded-lg shadow flex justify-between items-center">
                <div>
                  <p><strong>Doctor:</strong> {req.doctorId.firstName} {req.doctorId.lastName}</p>
                  <p><strong>Email:</strong> {req.doctorId.email}</p>
                </div>
                <button
                  onClick={() => handleDisconnect(req._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
                >
                  Disconnect
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="text-xl font-semibold mt-10 mb-4">Browse Available Doctors</h2>
      <input
        type="text"
        placeholder="Search by name or UIN"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 p-4 rounded-lg border border-gray-300 w-full max-w-md"
      />

      {filteredDoctors.length === 0 ? (
        <EmptyRequests />
      ) : (
        <ul className="space-y-6">
          {filteredDoctors.map((doc) => (
            <li key={doc._id} className="bg-white border p-6 rounded-lg shadow flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{doc.firstName} {doc.lastName}</p>
                <p className="text-sm text-gray-500">UIN: {doc.uin}</p>
                <p className="text-sm text-gray-500">Email: {doc.email}</p>
              </div>
              {sentRequests.includes(doc._id) ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle2 className="w-6 h-6" /> Request Sent
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(doc._id)}
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" /> Connect
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ConnectionRequests;

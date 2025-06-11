import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UserPlus, CheckCircle2, XCircle } from "lucide-react";

function BrowseClients() {
  const [clients, setClients] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClients();
    fetchSentRequests();
    fetchIncomingRequests();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/browse-clients`, {
        withCredentials: true
      });
      setClients(res.data || []);
    } catch {
      setClients([]);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/connection-requests/sent`, {
        withCredentials: true
      });
      setSentRequests(res.data.map(r => r.clientId));
    } catch {
      setSentRequests([]);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/client-requests`, {
        withCredentials: true
      });
      setIncomingRequests(res.data || []);
    } catch {
      toast.error("Failed to load incoming requests");
    }
  };

  const handleConnect = async (clientId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/doctor/request-connection/${clientId}`, {}, {
        withCredentials: true
      });
      toast.success("Request sent");
      setSentRequests(prev => [...prev, clientId]);
    } catch {
      toast.error("Failed to send request");
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/doctor/respond-client-request/${requestId}`, {
        action
      }, {
        withCredentials: true
      });
      toast.success(`Request ${action}ed`);
      fetchIncomingRequests();
    } catch {
      toast.error("Failed to respond");
    }
  };

  const filteredClients = clients.filter(c =>
    `${c.firstName} ${c.lastName} ${c.uin}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Browse Available Clients</h1>

      <input
        type="text"
        placeholder="Search by name or UIN"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-6 p-4 rounded-lg border border-gray-300"
      />

      {/* 🔔 Incoming Client Requests */}
      {incomingRequests.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Incoming Requests from Clients</h2>
          <ul className="space-y-5 mb-10">
            {incomingRequests.map(req => (
              <li key={req._id} className="p-6 border rounded-lg shadow bg-white">
                <div>
                  <p className="font-semibold">{req.clientId.firstName} {req.clientId.lastName}</p>
                  <p className="text-sm text-gray-500">UIN: {req.clientId.uin}</p>
                  <p className="text-sm text-gray-500">Email: {req.clientId.email}</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleRespond(req._id, "accept")}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(req._id, "reject")}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 📋 Unassigned Clients */}
      {filteredClients.length === 0 ? (
        <p>No matching clients found.</p>
      ) : (
        <ul className="space-y-5">
          {filteredClients.map(client => (
            <li
              key={client._id}
              className="p-6 border rounded-lg shadow flex justify-between items-center bg-white"
            >
              <div>
                <p className="font-semibold text-gray-800">{client.firstName} {client.lastName}</p>
                <p className="text-sm text-gray-500">UIN: {client.uin}</p>
                <p className="text-sm text-gray-500">Email: {client.email}</p>
              </div>
              {sentRequests.includes(client._id) ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle2 className="w-6 h-6" /> Request Sent
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(client._id)}
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

export default BrowseClients;

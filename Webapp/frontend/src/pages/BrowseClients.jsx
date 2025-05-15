import { useEffect, useState } from "react";
import axios from "axios";
import { UserPlus, CheckCircle2 } from "lucide-react";

function BrowseClients() {
  const [clients, setClients] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/doctor/browse-clients", { withCredentials: true });
        setClients(Array.isArray(res.data) ? res.data : []);
      } catch {
        setClients([]);
      }
    };

    const fetchSentRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/doctor/connection-requests/sent", { withCredentials: true });
        setSentRequests(Array.isArray(res.data) ? res.data.map(r => r.clientId) : []);
      } catch {
        setSentRequests([]);
      }
    };

    fetchClients();
    fetchSentRequests();
  }, []);

  const handleConnect = async (clientId) => {
    try {
      await axios.post(`http://localhost:5000/api/doctor/request-connection/${clientId}`, {}, { withCredentials: true });
      setSentRequests(prev => [...prev, clientId]);
    } catch {
      // handle error silently or show toast
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

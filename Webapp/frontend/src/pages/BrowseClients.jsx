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
        const res = await axios.get("http://localhost:5000/api/doctor/browse-clients", {
          withCredentials: true,
        });
        setClients(res.data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };

    const fetchSentRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/doctor/connection-requests/sent", {
          withCredentials: true,
        });
        const sentClientIds = res.data.map((req) => req.clientId);
        setSentRequests(sentClientIds);
      } catch (err) {
        console.error("Error fetching sent requests:", err);
      }
    };

    fetchClients();
    fetchSentRequests();
  }, []);

  const handleConnect = async (clientId) => {
    try {
      await axios.post(`http://localhost:5000/api/doctor/request-connection/${clientId}`, {}, {
        withCredentials: true,
      });
      setSentRequests((prev) => [...prev, clientId]);
    } catch (err) {
      console.error("Connection request failed:", err);
    }
  };

  const filteredClients = clients.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.uin}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Browse Available Clients</h1>

      <input
        type="text"
        placeholder="Search by name or UIN"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border px-4 py-2 mb-4 rounded-md"
      />

      {filteredClients.length === 0 ? (
        <p>No matching clients found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredClients.map((client) => (
            <li key={client._id} className="p-4 border rounded-md shadow-sm bg-white flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{client.firstName} {client.lastName}</p>
                <p className="text-sm text-gray-500">UIN: {client.uin}</p>
                <p className="text-sm text-gray-500">Email: {client.email}</p>
              </div>
              {sentRequests.includes(client._id) ? (
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <CheckCircle2 className="w-5 h-5" /> Request Sent
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(client._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Connect
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

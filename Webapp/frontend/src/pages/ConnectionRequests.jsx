import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { EmptyRequests } from "../components/illustrations/EmptyRequests";

function ConnectionRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const [pendingRes, acceptedRes] = await Promise.all([
        axios.get("http://localhost:5000/api/prediction/pending-requests", { withCredentials: true }),
        axios.get("http://localhost:5000/api/prediction/accepted-connections", { withCredentials: true }),
      ]);
      setPendingRequests(pendingRes.data);
      setAcceptedRequests(acceptedRes.data);
    } catch {
      toast.error("Failed to load connection requests");
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await axios.post(
        `http://localhost:5000/api/prediction/respond-request/${requestId}`,
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
        `http://localhost:5000/api/prediction/disconnect-request/${requestId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Disconnected successfully");
      fetchRequests();
    } catch {
      toast.error("Failed to disconnect");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Doctor Connection Requests</h1>

      {pendingRequests.length === 0 && acceptedRequests.length === 0 ? (
        <>
          <EmptyRequests />
          <p className="text-center text-gray-500">No connection requests at the moment.</p>
        </>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
              <ul className="space-y-6">
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
              <h2 className="text-xl font-semibold mt-8 mb-4">Connected Doctors</h2>
              <ul className="space-y-6">
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
        </>
      )}
    </div>
  );
}

export default ConnectionRequests;
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function ConnectionRequests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/prediction/pending-requests", {
        withCredentials: true,
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load connection requests", err);
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
      fetchRequests(); // Refresh list after action
    } catch (err) {
      console.error("Failed to respond to request", err);
      toast.error("Failed to respond to request");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Doctor Connection Requests</h1>
      {requests.length === 0 ? (
        <p>No connection requests at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li key={req._id} className="bg-white border p-4 rounded-md shadow-sm">
              <p><strong>Doctor:</strong> {req.doctorId.firstName} {req.doctorId.lastName}</p>
              <p><strong>Email:</strong> {req.doctorId.email}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleRespond(req._id, "accept")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRespond(req._id, "reject")}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ConnectionRequests;

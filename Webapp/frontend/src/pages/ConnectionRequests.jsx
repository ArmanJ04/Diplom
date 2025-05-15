import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { EmptyRequests } from "../components/illustrations/EmptyRequests";

function ConnectionRequests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/prediction/pending-requests", { withCredentials: true });
      setRequests(res.data);
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
      fetchRequests();
    } catch {
      toast.error("Failed to respond to request");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Doctor Connection Requests</h1>
      {requests.length === 0 ? (
 <>
    <EmptyRequests />
    <p className="text-center text-gray-500">No connection requests at the moment.</p>
  </>      ) : (
        <ul className="space-y-6">
          {requests.map(req => (
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
      )}
    </div>
  );
}

export default ConnectionRequests;

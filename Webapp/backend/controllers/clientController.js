const User = require("../models/User");
const ConnectionRequest = require("../models/ConnectionRequest");
const mongoose = require('mongoose');

exports.getPendingConnectionRequests = async (req, res) => {
  try {
    const clientId = req.user.userId; // Logged-in client's ID
    const requests = await ConnectionRequest.find({
      clientId,
      status: 'pending_client_approval'
    }).populate('doctorId', 'firstName lastName email uin'); // Populate doctor details

    res.json(requests);
  } catch (error) {
    console.error("Error fetching pending connection requests for client:", error);
    res.status(500).json({ message: "Server error while fetching requests." });
  }
};

exports.acceptConnectionRequest = async (req, res) => {
  const { requestId } = req.params;
  const clientId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ message: "Invalid Request ID format." });
  }

  try {
    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Connection request not found." });
    }
    if (request.clientId.toString() !== clientId) {
      return res.status(403).json({ message: "Forbidden: This request is not for you." });
    }
    if (request.status !== 'pending_client_approval') {
      return res.status(400).json({ message: `Request is no longer pending. Current status: ${request.status}` });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Update client's assignedDoctorId
        const clientUser = await User.findByIdAndUpdate(clientId, 
            { assignedDoctorId: request.doctorId },
            { new: true, session }
        );

        if (!clientUser) {
            throw new Error("Client user not found during update.");
        }

        // 2. Update request status
        request.status = 'client_accepted';
        request.responseTimestamp = new Date();
        await request.save({ session });

        // 3. (Optional) Reject other pending requests for this client from other doctors
        await ConnectionRequest.updateMany(
            { clientId, status: 'pending_client_approval', _id: { $ne: request._id } },
            { $set: { status: 'client_rejected', responseTimestamp: new Date() } },
            { session }
        );
        
        await session.commitTransaction();

        // TODO: Notify the doctor that their request was accepted
        // const doctor = await User.findById(request.doctorId);
        // sendNotification(doctor.email, "Connection Request Accepted", `${clientUser.firstName} ${clientUser.lastName} has accepted your connection request.`);

        res.json({ message: "Connection request accepted successfully.", client: clientUser });

    } catch (error) {
        await session.abortTransaction();
        console.error("Error processing accept connection request:", error);
        res.status(500).json({ message: "Server error while accepting request." });
    } finally {
        session.endSession();
    }

  } catch (error) {
    // Catches errors before starting session (e.g., initial findById)
    console.error("Error accepting connection request (outer):", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.rejectConnectionRequest = async (req, res) => {
  const { requestId } = req.params;
  const clientId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ message: "Invalid Request ID format." });
  }

  try {
    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Connection request not found." });
    }
    if (request.clientId.toString() !== clientId) {
      return res.status(403).json({ message: "Forbidden: This request is not for you." });
    }
    if (request.status !== 'pending_client_approval') {
      return res.status(400).json({ message: `Request is no longer pending. Current status: ${request.status}` });
    }

    request.status = 'client_rejected';
    request.responseTimestamp = new Date();
    await request.save();

    // TODO: Notify the doctor that their request was rejected
    // const doctor = await User.findById(request.doctorId);
    // sendNotification(doctor.email, "Connection Request Rejected", `Your connection request to a client was rejected.`);


    res.json({ message: "Connection request rejected successfully.", request });
  } catch (error) {
    console.error("Error rejecting connection request:", error);
    res.status(500).json({ message: "Server error while rejecting request." });
  }
};

exports.getAssignedDoctor = async (req, res) => {
    try {
        const client = await User.findById(req.user.userId).populate('assignedDoctorId', 'firstName lastName email uin specialty'); // Add more fields if needed
        if (!client) {
            return res.status(404).json({ message: "Client profile not found." });
        }
        if (!client.assignedDoctorId) {
            return res.json({ message: "You are not currently assigned to a doctor.", doctor: null });
        }
        res.json({ doctor: client.assignedDoctorId });
    } catch (error) {
        console.error("Error fetching assigned doctor:", error);
        res.status(500).json({ message: "Server error." });
    }
};

exports.disconnectDoctor = async (req, res) => {
    const clientId = req.user.userId;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const client = await User.findById(clientId).session(session);
        if (!client) {
            throw new Error("Client not found.");
        }
        const doctorId = client.assignedDoctorId;
        if (!doctorId) {
            return res.status(400).json({ message: "You are not currently assigned to any doctor." });
        }

        client.assignedDoctorId = null;
        await client.save({ session });

        // Update the status of the connection request that led to this assignment (if desired)
        // For example, mark it as 'client_disconnected' or similar.
        // This step depends on how you want to track the history of connections.
        // For simplicity, we'll just clear the assignment here.
        // Example:
        await ConnectionRequest.findOneAndUpdate(
            { doctorId, clientId, status: 'client_accepted' },
            { $set: { status: 'client_disconnected', responseTimestamp: new Date() } }, // You might need a new status 'client_disconnected'
            { session, sort: { createdAt: -1 } } // Get the latest accepted request if multiple somehow exist
        );


        await session.commitTransaction();
        // TODO: Notify the doctor that the client has disconnected.
        res.json({ message: "Successfully disconnected from the doctor." });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error disconnecting doctor:", error);
        res.status(500).json({ message: "Server error while disconnecting from doctor." });
    } finally {
        session.endSession();
    }
};
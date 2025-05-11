const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController"); // We will create this next
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(checkRole(['client'])); // All routes here are for clients

// GET /api/client/connection-requests - Get pending connection requests for the logged-in client
router.get("/connection-requests", clientController.getPendingConnectionRequests);

// PUT /api/client/connection-requests/:requestId/accept - Client accepts a doctor's request
router.put("/connection-requests/:requestId/accept", clientController.acceptConnectionRequest);

// PUT /api/client/connection-requests/:requestId/reject - Client rejects a doctor's request
router.put("/connection-requests/:requestId/reject", clientController.rejectConnectionRequest);

// GET /api/client/assigned-doctor - Get details of the currently assigned doctor
router.get("/assigned-doctor", clientController.getAssignedDoctor);

// DELETE /api/client/disconnect-doctor - Client disconnects from their assigned doctor
router.delete("/disconnect-doctor", clientController.disconnectDoctor);


module.exports = router;

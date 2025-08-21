const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController"); // We will create this next
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(checkRole(['patient'])); 
router.get("/connection-requests", clientController.getPendingConnectionRequests);
router.put("/connection-requests/:requestId/accept", clientController.acceptConnectionRequest);
router.put("/connection-requests/:requestId/reject", clientController.rejectConnectionRequest);
router.get("/assigned-doctor", clientController.getAssignedDoctor);
router.delete("/disconnect-doctor", clientController.disconnectDoctor);
router.get("/browse-doctors", clientController.browseDoctors);
router.get("/sent-requests", clientController.getClientSentRequests);
router.post("/request-connection/:doctorId", clientController.clientRequestConnection);
router.get("/prediction/accepted-connections", clientController.getAcceptedConnectionsForClient);

module.exports = router;

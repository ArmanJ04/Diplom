const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connectionRequestSchema = new Schema({
  doctorId: { // The doctor initiating the request
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  clientId: { // The client being requested
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending_client_approval', 'client_accepted', 'client_rejected', 'doctor_cancelled', "disconnected" ],
    default: 'pending_client_approval'
  },
  requestTimestamp: { // When the doctor sent the request
    type: Date,
    default: Date.now
  },
  responseTimestamp: { // When the client responded (accepted/rejected)
    type: Date
  }
}, { timestamps: true }); // Adds createdAt, updatedAt

// To prevent duplicate pending requests from the same doctor to the same client
connectionRequestSchema.index(
  { doctorId: 1, clientId: 1, status: 'pending_client_approval' },
  { unique: true, partialFilterExpression: { status: 'pending_client_approval' } }
);
// Index for clients to find their pending requests
connectionRequestSchema.index({ clientId: 1, status: 1 });
// Index for doctors to find their sent requests
connectionRequestSchema.index({ doctorId: 1, status: 1 });

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);

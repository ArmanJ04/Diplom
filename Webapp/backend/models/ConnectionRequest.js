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
  enum: [
    'pending_client_approval',
    'client_accepted',
    'client_rejected',
    'doctor_cancelled',
    'disconnected',
    'pending_doctor_approval', 
    'doctor_accepted',        
    'doctor_rejected'       
  ],
  default: 'pending_client_approval'
},initiatedBy: {
  type: String,
  enum: ['doctor', 'client'],
  required: true
},
  requestTimestamp: { 
    type: Date,
    default: Date.now
  },
  responseTimestamp: { 
    type: Date
  }
}, { timestamps: true }); 

connectionRequestSchema.index(
  { doctorId: 1, clientId: 1, status: 'pending_client_approval' },
  { unique: true, partialFilterExpression: { status: 'pending_client_approval' } }
);
connectionRequestSchema.index({ clientId: 1, status: 1 });
connectionRequestSchema.index({ doctorId: 1, status: 1 });


module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);

import mongoose from "mongoose";
const LabTestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: "Lab", required: true },
  testName: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["pending", "accepted", "completed", "rejected"], default: "pending" },
  appointmentDate: { type: Date, required: true },
  
  resultFileId: { type: mongoose.Schema.Types.ObjectId }, 
  resultFile: { 
    data: Buffer,       // the file content
    contentType: String // mime type (pdf, image, etc)
  },

  requestedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export default mongoose.model("LabTest", LabTestSchema);

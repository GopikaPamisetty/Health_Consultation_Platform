import LabTest from "../models/LabTest.js";
import User from "../models/patient.js"; 
import Lab from "../models/Lab.js"
import nodemailer from "nodemailer";
import { sendMail as sendEmail } from "../utils/emailService.js";

export const getLabTestRequests = async (req, res) => {
  try {
    const labId = req.user._id;
    const tests = await LabTest.find({ labId })
      .populate("patientId", "name email") // get patient name & email
      .sort({ requestedAt: -1 });

    res.json(tests);
  } catch (err) {
    console.error("Get Lab Test Requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update test status (accept/reject/complete)
export const updateLabTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, result } = req.body;

    // populate patient to get email
    const test = await LabTest.findById(id).populate("patientId");
    if (!test) return res.status(404).json({ message: "Test request not found" });

    if (status) test.status = status;
    if (result) {
      test.result = result;
      test.completedAt = new Date();
    }

    await test.save();

    // -----------------------------
    //  SEND EMAIL NOTIFICATION
    // -----------------------------
    try {
      if (status === "accepted" || status === "rejected") {
        const emailSubject =
          status === "accepted"
            ? "Your Lab Test Has Been Accepted"
            : "Your Lab Test Has Been Rejected";

        const emailMessage =
          status === "accepted"
            ? `
              <h2>Hello ${test.patientId.name},</h2>
              <p>Your lab test <b>${test.testName}</b> has been <b>ACCEPTED</b>.</p>
              <p>Appointment Date: <b>${test.appointmentDate}</b></p>
              <p>Please be available at the scheduled time.</p>
            `
            : `
              <h2>Hello ${test.patientId.name},</h2>
              <p>Your lab test <b>${test.testName}</b> has been <b>REJECTED</b>.</p>
              <p>Please contact support for further details.</p>
            `;

        await sendEmail(test.patientId.email, emailSubject, emailMessage);
        console.log(" Email Sent To:", test.patientId.email);
      }
    } catch (mailError) {
      console.error("❌ Email Sending Error:", mailError);
    }

    res.json(test);

  } catch (err) {
    console.error("Update Lab Test Status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
  
export const createLabTestRequest = async (req, res) => {
  try {
    console.log("=== /book-test called ===");
    console.log("Request body:", req.body);

    const { labId, testName, description, appointmentDate, } = req.body;
    const patientId = req.user._id;

    console.log("Parsed appointmentDate:", appointmentDate);

    if (!appointmentDate) {
      return res.status(400).json({ message: "Appointment date required" });
    }

    const lab = await Lab.findById(labId);
    if (!lab) return res.status(404).json({ message: "Lab not found" });

    console.log("Lab found:", lab.name);

    const newRequest = await LabTest.create({
      patientId,
      labId,
      testName,
      description,
      appointmentDate: new Date(appointmentDate),
      status: "pending",
      requestedAt: new Date(),
    });

    res.status(201).json({
      message: "Lab test request created",
      labTest: newRequest,
    });
  } catch (err) {
    console.error("=== Booking error ===");
    console.error(err);
    console.error("Error message:", err.message);
    console.error("Validation errors:", err.errors);
    res.status(500).json({ message: err.message, errors: err.errors });
  }
};
  
// Optional: patient can view their requests
  export const getPatientLabTests = async (req, res) => {
    try {
      const patientId = req.user._id;
      const labTests = await LabTest.find({ patientId }).populate("labId", "name email");
      res.json(labTests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };
import express from 'express';
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  resetPassword,
  getPatientProfile, updatePatientProfile
} from '../controllers/authController.js';
import authMiddleware from "../middleware/authMiddleware.js";
import Patient from "../models/patient.js";
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

router.get("/profile/me", authMiddleware("patient"), async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id).select("-password");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json(patient);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

router.put("/profile/me", authMiddleware("patient"), async (req, res) => {
  try {
    const { name, phone, address, age } = req.body;

    const patient = await Patient.findById(req.user._id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update fields
    if (name) patient.name = name;
    if (phone) patient.phone = phone;
    if (address) patient.address = address;
    if (age) patient.age = age;

    await patient.save();
    res.status(200).json({ message: "Profile updated successfully", patient });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

router.get("/patient/:patientId", authMiddleware, async (req, res) => {
  try {
    const tests = await LabTest.find({ patientId: req.params.patientId });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

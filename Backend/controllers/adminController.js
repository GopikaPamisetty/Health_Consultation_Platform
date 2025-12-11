
import Doctor from '../models/doctor.js';
import Feedback from '../models/Feedback.js';
import { sendMail } from "../utils/emailService.js";

export const getAllDoctorsForAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password'); // exclude password
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
  }
};

export const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    //  Send approval email
    const html = `
      <h2>Congratulations, Dr. ${doctor.name}!</h2>
      <p>Your account has been <b>approved</b> by the admin.</p>
      <p>You can now log in and start managing your appointments.</p>
      <br/>
      <p>🩺 <b>Health Consultation Team</b></p>
    `;

    await sendMail(doctor.email, "Doctor Approval Confirmation", html);

    res.json({ message: "Doctor approved successfully", doctor });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ error: "Approval failed", details: error.message });
  }
};



// Get approval status + doctor details
export const getApprovalStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('isApproved name email imageUrl');

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      isApproved: doctor.isApproved,
      name: doctor.name,
      email: doctor.email,
      imageUrl: doctor.imageUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch approval status', details: error.message });
  }
};


export const getAllFeedbacksSorted = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name')
      .sort({ createdAt: -1 }); // Sort by latest first

    const formatted = feedbacks.map(fb => ({
      doctorName: fb.doctorId.name,
      specialization: fb.doctorId.specialization,
      patientName: fb.patientId.name,
      rating: fb.rating,
      comment: fb.comment,
      createdAt: fb.createdAt
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedbacks' });
  }
};

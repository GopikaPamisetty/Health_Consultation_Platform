import express from 'express';
import Feedback from '../models/Feedback.js';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

// POST: Submit feedback (only authenticated patients)
router.post('/', authMiddleware('patient'), async (req, res) => {
  try {
    const { appointmentId, doctorId, rating, comment } = req.body;

    // Prevent multiple feedback submissions
    const existing = await Feedback.findOne({ appointmentId });
    if (existing) {
      return res.status(400).json({ message: 'Feedback already submitted.' });
    }

    const feedback = new Feedback({
      appointmentId,
      doctorId,
      patientId: req.user._id,
      rating,
      comment
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware('doctor'), async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ doctorId: req.user._id })
      .populate('patientId', 'name');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Feedback for a specific appointment (for doctor or patient)
router.get('/appointment/:id', authMiddleware(), async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ appointmentId: req.params.id });

    // Optional: Restrict access to the related doctor or patient only
    if (
      req.user.role === 'doctor' && feedback?.doctorId.toString() !== req.user._id ||
      req.user.role === 'patient' && feedback?.patientId.toString() !== req.user._id
    ) {
      return res.status(403).json({ message: 'Not authorized to view this feedback' });
    }

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import express from 'express';
import Patient from '../models/patient.js';
import Doctor from '../models/doctor.js';
import Appointment from '../models/appointment.js';
import Feedback from '../models/Feedback.js';

const router = express.Router();
// GET /api/admin/analytics/stats
router.get('/stats', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const approvedDoctors = await Doctor.countDocuments({ isApproved: true });
    const notApprovedDoctors = await Doctor.countDocuments({ isApproved: false });
    const ratingAggregation = await Feedback.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = ratingAggregation.length ? ratingAggregation[0].avgRating : 0;

    res.json({ totalPatients, totalDoctors, totalAppointments, approvedDoctors,
      notApprovedDoctors,avgRating });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/appointments-over-time', async (req, res) => {
  try {
    const data = await Appointment.aggregate([
      {
        $addFields: {
          dateAsDate: { $dateFromString: { dateString: "$date" } }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateAsDate' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const formatted = data.map(d => ({
      date: d._id,
      count: d.count
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching appointments over time:', error);
    res.status(500).json({ error: 'Failed to fetch appointments over time' });
  }
});

// to GET /api/admin/analytics/doctor-specializations
router.get('/doctor-specializations', async (req, res) => {
  try {
    const data = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 }
        }
      }
    ]);
    const formatted = data.map(d => ({ name: d._id, count: d.count }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching doctor specializations:', error);
    res.status(500).json({ error: 'Failed to fetch doctor specializations' });
  }
});


export default router;

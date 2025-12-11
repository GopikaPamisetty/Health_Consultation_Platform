import express from 'express';
import jwt from 'jsonwebtoken';
import {
  approveDoctor,
 getApprovalStatus,
  getAllDoctorsForAdmin, 
  getAllFeedbacksSorted
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin@123'; // move to env in production

//  Admin Login Route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ msg: 'Unauthorized: Invalid credentials' });
  }

  const token = jwt.sign(
    { email, role: 'admin' },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '1h' }
  );

  res.json({ token, role: 'admin' });
});

//  Admin-only middleware
const adminProtect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ msg: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

//  Get all doctors (admin dashboard)
router.get('/doctors', adminProtect, getAllDoctorsForAdmin);

//  Approve doctor manually
router.put('/approve-doctor/:id', adminProtect, approveDoctor);
router.get('/approval-status', authMiddleware, getApprovalStatus);


router.get('/analytics/all-feedbacks', adminProtect, getAllFeedbacksSorted);


export default router;
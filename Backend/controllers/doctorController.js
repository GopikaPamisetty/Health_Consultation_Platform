import Doctor from '../models/doctor.js';

export const getAllDoctors = async (req, res) => {
  try {
    const { spec, showAll } = req.query;
    const filter = {
      ...(spec && { specialization: { $regex: spec, $options: 'i' } }),
      ...(showAll !== 'true' && { isApproved: true })  // Only approved unless ?showAll=true
    };

    const doctors = await Doctor.find(filter).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
  }
};

//  GET /api/doctors/:id
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctor details', error: error.message });
  }
};

//  GET /api/doctors/profile/me
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id).select('-password');
    if (!doctor) return res.status(404).json({ message: 'Profile not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

//  PUT /api/doctors/profile/me
export const updateDoctorProfile = async (req, res) => {
  try {
    let doctor = await Doctor.findById(req.user._id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    console.log("Incoming experience:", req.body.experience);
console.log("Before save:", doctor.experience);

    const updates = req.body;
    //  Safely apply only defined, non-empty fields
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        key !== 'password'
      ) {
        if (key === "experience") {
          doctor[key] = Number(value);  
        } else {
          doctor[key] = value;
        }
        
      }
    });

    await doctor.save();
    doctor = doctor.toObject();
    delete doctor.password;

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

export const getDoctorApprovalStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id).select('isApproved name email imageUrl');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json({
      isApproved: doctor.isApproved,
      name: doctor.name,
      email: doctor.email,
      imageUrl: doctor.imageUrl,
    });
  } catch (error) {
    console.error('Error in getDoctorApprovalStatus:', error);
    res.status(500).json({ message: 'Error fetching approval status' });
  }
};


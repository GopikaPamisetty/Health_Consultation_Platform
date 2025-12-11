import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
// Same email validation regex
const emailValidator = (email) => {
  return /^[\w-\.]+@gmail\.com$/.test(email);
};
const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // uniqueness at collection level
    lowercase: true,
    validate: [emailValidator, 'Email must end with @meditrack.local'],
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => /^\d{10}$/.test(v),
      message: "Phone number must be 10 digits",
    },
  },
  age: Number,
  gender: String,
}, { timestamps: true });


patientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // only hash if new or changed
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;

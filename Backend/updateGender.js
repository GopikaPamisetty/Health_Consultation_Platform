import connectDB from './db.js';
import Patient from './models/patient.js'; // adjust path if needed
import dotenv from 'dotenv';
dotenv.config();

const updateExistingPatients = async () => {
  try {
    await connectDB();

    const result = await Patient.updateMany(
      { gender: { $exists: false } }, // only documents without gender
      { $set: { gender: 'Not Specified' } } // default value
    );

    console.log(`Updated ${result.modifiedCount} patients`);
    process.exit(0); // exit cleanly
  } catch (err) {
    console.error('Error updating patients:', err);
    process.exit(1);
  }
};

updateExistingPatients();

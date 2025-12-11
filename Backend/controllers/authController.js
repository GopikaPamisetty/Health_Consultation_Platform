import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import Doctor from '../models/doctor.js';
import Patient from '../models/patient.js';
import { sendMail } from "../utils/emailService.js";  
import nodemailer from "nodemailer";
import Lab from "../models/Lab.js"

export const register = async (req, res) => {
  let { name, email, password, role } = req.body;
  console.log("Register API called with body:", req.body);
  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  const normalizedRole = role.toLowerCase();
  //  Validate email
  if (!validator.isEmail(email) || !email.endsWith("@gmail.com")) {
    return res
      .status(400)
      .json({ message: "Email must be valid and end with @gmail.com" });
  }
  //  Validate password strength
  const isStrong = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isStrong) {
    return res.status(400).json({
      message:
        "Password must be strong (min 8 chars, upper, lower, number, symbol)",
    });
  }

  try {
    let Model;
    if (normalizedRole === "doctor") Model = Doctor;
    else if (normalizedRole === "patient") Model = Patient;
    else if (normalizedRole === "lab") Model = Lab;
    else return res.status(400).json({ message: "Invalid role" });

    //  Check existing
    const existingUser = await Model.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    //  Save new user
    const newUser = new Model({
      name,
      email,
      password,
      role: normalizedRole,
    });

    await newUser.save();

    //  Send Welcome Email after successful registration
    try {
      await sendMail(
        email,
        "🎉 Welcome to HealthConsultation Portal",
        `
        <h2>Welcome, ${name}!</h2>
        <p>Your ${normalizedRole} account has been successfully created.</p>
        <p>You can now log in and start using our platform.</p>
        <br/>
        <p>Best regards,<br/>The HealthCare Team 🩺</p>
        `
      );
      console.log("✅ Registration email sent to:", email);
    } catch (mailError) {
      console.error("❌ Error sending welcome email:", mailError);
    }

    res.status(201).json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } registered successfully. A welcome email has been sent.`,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

  export const login = async (req, res) => {
    const { email, password } = req.body;
  
    let user = await Doctor.findOne({ email });
    let role = "doctor";
  
    if (!user) {
      user = await Patient.findOne({ email });
      role = "patient";
    }
  
    if (!user) {
      user = await Lab.findOne({ email });
      role = "lab";
    }
  
    if (!user) return res.status(404).json({ message: "User not found" });
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  
    const token = jwt.sign({ id: user._id, role, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
    res.json({ message: "Login successful", token, user: { _id: user._id, name: user.name, email: user.email, role } });
  };
  


export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id).select("-password");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};
export const updatePatientProfile = async (req, res) => {
  try {
    const { name, phone, age, gender, bio, imageUrl } = req.body;

    const updated = await Patient.findByIdAndUpdate(
      req.user.id,
      { name, phone, age, gender, bio, imageUrl },
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "Patient not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};
  
  
// === SEND OTP ===



export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: "Valid email required" });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail ID
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};
export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ message: "No OTP found" });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }
  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  otpStore.delete(email);
  res.status(200).json({ message: "OTP verified successfully" });
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password required' });
  }

  const isStrong = validator.isStrongPassword(newPassword, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isStrong) {
    return res.status(400).json({
      message: 'Password must be strong (min 8 chars, upper, lower, number, symbol)',
    });
  }

  try {
    const doctor = await Doctor.findOne({ email }).select('+password');
    const patient = await Patient.findOne({ email }).select('+password');
    const user = doctor || patient;

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;              // DO NOT manually hash here
    await user.save();       

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset error:', err);
    return res.status(500).json({ message: 'Server error during password reset' });
  }
};



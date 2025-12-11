import Lab from "../models/Lab.js";
import mongoose from "mongoose";
import multer from "multer";
import LabTest from "../models/LabTest.js";
import fs from "fs";
import path from "path";
export const getLabProfile = async (req, res) => {
  try {
    const lab = await Lab.findById(req.user._id).select("-password");

    if (!lab) return res.status(404).json({ message: "Lab not found" });
    res.json(lab);
  } catch (err) {
    console.error("Lab profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLabProfile = async (req, res) => {
  try {
    const { name, contact, address, tests } = req.body;
    const lab = await Lab.findById(req.user._id);

    if (!lab) return res.status(404).json({ message: "Lab not found" });

    if (name) lab.name = name;
    if (contact) lab.contact = contact;
    if (address) lab.address = address;
    if (tests) lab.tests = tests; 
    await lab.save();
    res.json(lab);
  } catch (err) {
    console.error("Update lab profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllLabs = async (req, res) => {
  try {
    console.log("Fetching all labs for patient booking");
    const labs = await Lab.find().select("name email contact address");
    console.log("Labs fetched:", labs);
    res.json(labs);
  } catch (err) {
    console.error("Get all labs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const upload = multer({ storage: multer.memoryStorage() });

// GridFSBucket setup
let gfs;
const conn = mongoose.connection;
conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "testResults" });
});


export const uploadTestResult = async (req, res) => {
  try {
    const { testId } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Ensure uploads folder exists
    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

    // Save file to uploads folder
    const fileName = Date.now() + "-" + req.file.originalname;
    const filePath = path.join("uploads", fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    // Save path to LabTest
    const labTest = await LabTest.findByIdAndUpdate(
      testId,
      { resultFilePath: filePath, status: "completed", completedAt: new Date() },
      { new: true }
    );

    res.status(200).json({ message: "File uploaded successfully", labTest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const downloadTestResult = async (req, res) => {
  try {
    const { fileId } = req.params;

    const labTest = await LabTest.findById(fileId);
    if (!labTest || !labTest.resultFilePath)
      return res.status(404).json({ message: "File not found" });

    const filePath = path.resolve(labTest.resultFilePath);

    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "File missing on server" });

    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Download failed" });
  }
};
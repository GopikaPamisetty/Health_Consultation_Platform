import express from "express";
import { getLabProfile, updateLabProfile,getAllLabs,upload, uploadTestResult, downloadTestResult } from "../controllers/labController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Lab from "../models/Lab.js"
import LabTest from "../models/LabTest.js";
import multer from "multer";
import path from "path";
const storage = multer.memoryStorage();
const multerStorage = multer({ storage });  // renamed

const router = express.Router();
router.get("/", getAllLabs); // list all labs

router.get("/tests/:labId", async (req, res) => {
  const { labId } = req.params;

  try {
    const lab = await Lab.findById(labId).select("tests name");
    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    res.json(lab.tests); // return only the tests array
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/book-test", async (req, res) => {
  try {
    console.log("=== /book-test called ===");
    console.log("Request body:", req.body);

    const { labId, testName, description, patientId, appointmentDate } = req.body;

    // check required fields
    if (!labId || !testName || !patientId || !appointmentDate) {
      return res.status(400).json({
        message: "Lab ID, test name, patient ID, and appointment date are required"
      });
    }

    // verify lab exists
    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    console.log("Lab found:", lab.name);

    // create booking
    const booking = await LabTest.create({
      labId,
      testName,
      description: description || "",
      patientId,
      appointmentDate: new Date(appointmentDate), 
      status: "pending",
      requestedAt: new Date()
    });

    res.status(201).json({ message: "Lab test booked successfully", booking });

  } catch (err) {
    console.error("=== Booking error ===");
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

//  All lab routes require auth
router.get("/profile", authMiddleware("lab"), getLabProfile);
router.put("/profile", authMiddleware("lab"), updateLabProfile);
router.post("/upload-result/:id", multerStorage.single("file"), async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    test.resultFile = {
      data: req.file.buffer,           
      contentType: req.file.mimetype,  
    };

    test.status = "completed";
    test.completedAt = new Date();

    // await test.save();
    await test.save({ validateBeforeSave: false });

    res.json({ message: "File uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/download-result/:id", async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test || !test.resultFile) return res.status(404).json({ message: "File not found" });

    res.set("Content-Type", test.resultFile.contentType);
    res.set("Content-Disposition", `attachment; filename=${test.testName}-result.pdf`);
    res.send(test.resultFile.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;



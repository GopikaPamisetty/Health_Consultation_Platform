import express from "express";
import { getLabTestRequests, updateLabTestStatus, createLabTestRequest, getPatientLabTests } from "../controllers/labTestController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import LabTest from "../models/LabTest.js";
const router = express.Router();
import path from "path";
import fs from "fs";

router.get("/", authMiddleware("lab"), getLabTestRequests);
router.put("/:id", authMiddleware("lab"), updateLabTestStatus);
router.get("/my-tests", authMiddleware("patient"), getPatientLabTests);
router.get("/tests", authMiddleware("lab"), async (req, res) => {
    try {
        const labId = req.user._id; // Get lab ID from verified token
        const tests = await LabTest.find({ labId }).populate("patientId", "name email");
        res.json(tests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
  });

router.get("/patient/:patientId", async (req, res) => {
    try {
      const tests = await LabTest.find({ patientId: req.params.patientId })
        .populate("patientId", "name")
        .populate("labId", "name");
      // Convert resultFile buffer to URL (optional: only if file exists)
      const formattedTests = tests.map((t) => {
        let resultFileUrl = null;
        if (t.resultFile && t.resultFile.data) {
          // save a temporary file path for download
          const fileName = `${t._id}.pdf`;
          const filePath = path.join("uploads", fileName);
          fs.writeFileSync(filePath, t.resultFile.data); 
          resultFileUrl = `/uploads/${fileName}`; // accessible via static folder
        }
        return {
          _id: t._id,
          patientId: t.patientId,
          labId: t.labId,
          testName: t.testName,
          description: t.description,
          status: t.status,
          requestedAt: t.requestedAt,
          completedAt: t.completedAt,
          resultFile: resultFileUrl,
        };
      });
  
      res.json(formattedTests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

export default router;

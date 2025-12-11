import cron from "node-cron";
import Appointment from "../models/appointment.js";
import { sendMail } from "../utils/emailService.js";
import mongoose from "mongoose";

// Runs every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  console.log("⏰ Running daily appointment reminder...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  try {
    const appointments = await Appointment.find({ date: tomorrowDate, status: "Approved" }).populate("doctorId");

    for (const appt of appointments) {
      const doctorEmail = appt.doctorId?.email;
      const patientEmail = appt.email;

      if (doctorEmail) {
        await sendMail(
          doctorEmail,
          "📅 Upcoming Appointment Reminder",
          `<p>Dear Dr. ${appt.doctorId.name},</p>
           <p>You have an appointment with <b>${appt.patientName}</b> tomorrow at <b>${appt.time}</b>.</p>`
        );
      }

      if (patientEmail) {
        await sendMail(
          patientEmail,
          "⏰ Appointment Reminder",
          `<p>Dear ${appt.patientName},</p>
           <p>This is a reminder for your appointment with Dr. ${appt.doctorId.name} tomorrow at <b>${appt.time}</b>.</p>`
        );
      }
    }
  } catch (error) {
    console.error("Reminder job error:", error);
  }
});

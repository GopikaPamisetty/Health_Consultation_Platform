import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaNotesMedical,
  FaPills,
} from "react-icons/fa";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Approved");
  const [counts, setCounts] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewPrescriptionApp, setViewPrescriptionApp] = useState(null);
  const [prescription, setPrescription] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", timing: [] },
  ]);
  const [viewReportUrl, setViewReportUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAppointmentsByStatus(statusFilter);
    fetchAllCounts();
  }, [statusFilter]);

  const fetchAppointmentsByStatus = async (status) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${backendURL}/api/appointments/status/${status}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data);
    } catch {
      toast.error("Failed to load appointments");
    }finally {
      setLoading(false);
    }
  };

  const fetchAllCounts = async () => {
    const statuses = ["Approved", "In Progress", "Completed", "Missed","Rejected"];
    const newCounts = {};
  //   for (let s of statuses) {
  //     const res = await axios.get(
  //       `http://localhost:5000/api/appointments/status/${s}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     newCounts[s] = res.data.length;
  //   }
  //   setCounts(newCounts);
  // };
  try {
    setLoading(true);
    for (let s of statuses) {
      const res = await axios.get(
        `${backendURL}/api/appointments/status/${s}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      newCounts[s] = res.data.length;
    }
    setCounts(newCounts);
  } catch {
    toast.error("Failed to load counts");
  } finally {
    setLoading(false);
  }
};
  const updateStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      const payload =
        newStatus === "Completed"
          ? { status: newStatus, prescription, medicines }
          : { status: newStatus };

      await axios.patch(
        `${backendURL}/api/appointments/status/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Status updated successfully");
      setSelectedApp(null);
      setPrescription("");
      setMedicines([{ name: "", dosage: "", frequency: "", timing: [] }]);


      fetchAppointmentsByStatus(statusFilter);
      fetchAllCounts();
    } catch {
      toast.error("Failed to update status");
    }
    finally {
      setLoading(false);
    }
  };

  const groupMedicinesByTiming = (meds) => {
    const timings = ["Morning", "Afternoon", "Evening", "Night"];
    const grouped = {};
    timings.forEach((time) => {
      // grouped[time] = meds.filter(
      //   (m) => m.timing?.toLowerCase() === time.toLowerCase()
      grouped[time] = meds.filter(
        (m) => Array.isArray(m.timing) && m.timing.includes(time)
      );


    });
    return grouped;
  };

  const handlePrint = (appointment) => {
    let medicineHTML = "";

    if (appointment.medicines?.length > 0) {
      const grouped = groupMedicinesByTiming(appointment.medicines);
      medicineHTML += "<strong>Medicines:</strong>";
      Object.entries(grouped).forEach(([timing, meds]) => {
        if (meds.length > 0) {
          const medListHTML = meds
            .map(
              (med) =>
                `<li><strong>${med.name}</strong> - ${med.dosage} (${med.frequency})</li>`
            )
            .join("");
          medicineHTML += `<p><u>${timing}:</u></p><ul>${medListHTML}</ul>`;
        }
      });
    }
    const handleViewReport = async (appointmentId) => {
      try {
        const res = await fetch(
          `${backendURL}/api/appointments/report/${appointmentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch report");
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        setViewReportUrl(blobUrl);
      } catch (err) {
        console.error("Error viewing report:", err);
        toast.error("Failed to open report");
      }
    };

    const printContent = `
      <h3>Prescription Details</h3>
      <p><strong>Patient:</strong> ${appointment.patientName}</p>
      <p><strong>Date:</strong> ${appointment.date}</p>
      <p><strong>Time:</strong> ${appointment.time}</p>
      <p><strong>Doctor's Notes:</strong> ${appointment.prescription || "N/A"}</p>
      ${medicineHTML}
    `;

    const newWindow = window.open("", "_blank");
    newWindow.document.write(
      `<html><head><title>Prescription</title></head><body>${printContent}</body></html>`
    );
    newWindow.document.close();
    newWindow.print();
  };
  //  Enables "Start Treatment" from 5 mins before appointment time till the end of that day
  const canStartTreatment = (appDate, appTime) => {
    if (!appDate || !appTime) return false;

    const now = new Date();

    // Parse appointment date (YYYY-MM-DD)
    const [year, month, day] = appDate.split("-").map(Number);

    // Parse appointment time (e.g., "10:30 am")
    let [timePart, meridian] = appTime.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (meridian?.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (meridian?.toLowerCase() === "am" && hours === 12) hours = 0;

    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);

    //  If today is not the appointment day → disabled
    const isSameDate =
      now.getFullYear() === appointmentDateTime.getFullYear() &&
      now.getMonth() === appointmentDateTime.getMonth() &&
      now.getDate() === appointmentDateTime.getDate();

    if (!isSameDate) return false;

    //  Enable from 5 minutes before appointment time until 11:59 PM of the same day
    const fiveMinBefore = new Date(appointmentDateTime.getTime() - 5 * 60 * 1000);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    return now >= fiveMinBefore && now <= endOfDay;
  };


  return (
    <div className="min-h-screen bg-[#f9fafb] p-8 font-[Segoe_UI]">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-[#1f2937] mb-6 flex items-center gap-2">
          <FaUserMd className="text-blue-600" /> My Appointments
        </h1>

        {/* Status Summary */}
        <div className="flex flex-wrap gap-4 mb-6">
          {["Approved", "In Progress", "Completed", "Missed","Rejected"].map((status) => (
            <div
              key={status}
              className={`flex-1 sm:flex-initial text-center py-3 px-6 rounded-xl shadow-md ${status === "Approved"
                  ? "bg-green-100 text-green-700"
                  : status === "In Progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "Completed"
                      ? "bg-blue-100 text-blue-700"
                      : status === "Rejected"
                      ? "bg-pink-100 text-pink-900"
                      : "bg-red-100 text-red-700"
                }`}
            >
              <h3 className="font-semibold text-lg">{status}</h3>
              <p className="text-2xl font-bold">{counts[status] || 0}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          {["Approved", "In Progress", "Completed", "Missed","Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${statusFilter === status
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {loading ? (
  <div className="col-span-full flex justify-center items-center py-20">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
) : appointments.length === 0 ? (

          <p className="col-span-full text-center text-gray-600">
            No {statusFilter.toLowerCase()} appointments.
          </p>
        ) : (
          appointments.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-transform hover:-translate-y-1"
            >
              <div className="flex flex-col gap-2 mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {app.patientName}
                </h2>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <FaNotesMedical className="text-blue-600" />
                  Symptoms: {app.symptoms}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  {app.date}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  {app.time}
                </p>
                {/*  View & Download Report Buttons (Visible if report exists) */}
                {app.reportFile && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        window.open(
                          `http://localhost:5000/api/appointments/view-report/${app._id}`,
                          "_blank"
                        )
                      }
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm"
                    >
                      View Report
                    </button>

                    <a
                      href={`http://localhost:5000/api/appointments/view-report/${app._id}`}
                      download={`report_${app._id}.pdf`}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-center text-sm"
                    >
                      Download Report
                    </a>
                  </div>
                )}

              </div>

              {/* Action Buttons */}
              {statusFilter === "Approved" && (
                <button
                  onClick={() => updateStatus(app._id, "In Progress")}
                  disabled={!canStartTreatment(app.date, app.time)}
                  className={`w-full py-2 rounded-lg font-medium transition ${canStartTreatment(app.date, app.time)
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  Start Treatment
                </button>
              )}


              {statusFilter === "In Progress" && (
                <button
                  onClick={() => setSelectedApp(app)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition"
                >
                  Add Prescription
                </button>
              )}

              {statusFilter === "Completed" && (
                <button
                  onClick={() => setViewPrescriptionApp(app)}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-medium transition"
                >
                  View Prescription
                </button>
              )}
              {statusFilter === "Rejected" && (
  <div className="w-full text-center bg-pink-100 text-pink-800 py-2 rounded-lg font-semibold">
    Appointment Rejected
  </div>
)}

            </div>
          ))
        )}
      </div>
     


      {/* Add Prescription Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg relative">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaPills className="text-blue-600" /> Add Prescription
            </h2>

            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4"
              rows={3}
              placeholder="Enter prescription notes..."
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
            />

            {medicines.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Medicine name"
                  className="border p-2 rounded-md text-sm"
                  value={m.name}
                  onChange={(e) => {
                    const copy = [...medicines];
                    copy[i].name = e.target.value;
                    setMedicines(copy);
                  }}
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  className="border p-2 rounded-md text-sm"
                  value={m.dosage}
                  onChange={(e) => {
                    const copy = [...medicines];
                    copy[i].dosage = e.target.value;
                    setMedicines(copy);
                  }}
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  className="border p-2 rounded-md text-sm"
                  value={m.frequency}
                  onChange={(e) => {
                    const copy = [...medicines];
                    copy[i].frequency = e.target.value;
                    setMedicines(copy);
                  }}
                />
                <div className="flex flex-wrap gap-2 border p-2 rounded-md text-sm">
                  {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                    <label key={time} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={m.timing?.includes(time)}
                        onChange={(e) => {
                          const copy = [...medicines];
                          const updatedTimings = new Set(copy[i].timing || []);
                          if (e.target.checked) {
                            updatedTimings.add(time);
                          } else {
                            updatedTimings.delete(time);
                          }
                          copy[i].timing = Array.from(updatedTimings);
                          setMedicines(copy);
                        }}
                      />
                      {time}
                    </label>
                  ))}
                </div>

              </div>
            ))}

            <div className="flex justify-between mt-6">
              <button
                onClick={() =>
                  setMedicines([
                    ...medicines,
                    { name: "", dosage: "", frequency: "", timing: [] },
                  ])

                }
                className="text-blue-600 font-medium hover:underline"
              >
                + Add another
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(selectedApp._id, "Completed")}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {viewPrescriptionApp && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg relative">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Prescription Details
            </h2>

            <p><strong>Patient:</strong> {viewPrescriptionApp.patientName}</p>
            <p><strong>Date:</strong> {viewPrescriptionApp.date}</p>
            <p><strong>Time:</strong> {viewPrescriptionApp.time}</p>
            <p><strong>Doctor's Notes:</strong> {viewPrescriptionApp.prescription || 'N/A'}</p>

            {viewPrescriptionApp.medicines?.length > 0 && (
              <div className="mt-4">
                {Object.entries(groupMedicinesByTiming(viewPrescriptionApp.medicines)).map(([timing, meds]) =>
                  meds.length > 0 ? (
                    <div key={timing} className="mb-3">
                      <h4 className="font-semibold underline">{timing}</h4>
                      <ul className="list-disc list-inside">
                        {meds.map((med, idx) => (
                          <li key={idx}>
                            <strong>{med.name}</strong> - {med.dosage} ({med.frequency})
                            {med.timing?.length > 0 && (
                              <span className="text-gray-600">
                                {" "}
                                — <em>{Array.isArray(med.timing) ? med.timing.join(", ") : med.timing}</em>

                              </span>
                            )}
                          </li>
                        ))}
                      </ul>

                    </div>
                  ) : null
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => handlePrint(viewPrescriptionApp)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Print / Download
              </button>
              <button
                onClick={() => setViewPrescriptionApp(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;

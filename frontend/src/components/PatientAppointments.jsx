import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FeedbackModal from './FeedbackModal'; // keep path as-is
import { toast } from 'react-toastify';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openPrescriptions, setOpenPrescriptions] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState({});
  const [showFullFeedback, setShowFullFeedback] = useState({});
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user || !user._id) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const userId = user._id;

        const res = await axios.get(
         `${backendURL}/api/appointments/status/patient/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }

        );
        console.log("📡 [DEBUG] API Response from backend:", res.data);

        const withReports = res.data.filter(a => a.reportFile);
        console.log(`📄 [DEBUG] Appointments with reportFile: ${withReports.length}`);

        const withReportUrls = res.data.filter(a => a.reportUrl);
        console.log(`🔗 [DEBUG] Appointments with reportUrl: ${withReportUrls.length}`);


        setAppointments(res.data);

        // Fetch feedback for completed appointments
        const completed = res.data.filter((a) => a.status === 'Completed');
        const feedbackMap = {};

        await Promise.all(
          completed.map(async (appt) => {
            try {
              const fbRes = await axios.get(
               `${backendURL}/api/feedback/appointment/${appt._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (fbRes.data?.comment || fbRes.data?.rating) {
                feedbackMap[appt._id] = {
                  comment: fbRes.data.comment || '',
                  rating: fbRes.data.rating || 0,
                };
              }
              if (fbRes.data?.feedback) {
                feedbackMap[appt._id] = {
                  comment: fbRes.data.feedback.comment || '',
                  rating: fbRes.data.feedback.rating || 0,
                };
              }

            } catch (err) {
              feedbackMap[appt._id] = null;
            }
          })
        );

        setSubmittedFeedbacks(feedbackMap);

        setFilteredAppointments(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to fetch appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(
        (a) => a.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredAppointments(filtered);
    }
  }, [statusFilter, appointments]);

  const togglePrescription = (id) => {
    setOpenPrescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const groupMedicinesByTiming = (medicines) => {
    const timings = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const grouped = {};
    timings.forEach((time) => {
      grouped[time] = medicines.filter(
        (m) => m.timing?.toLowerCase() === time.toLowerCase()
      );
    });
    return grouped;
  };
  // ✅ Upload Patient Report
  // ✅ Upload Patient Report


  // ✅ Upload Patient Report (Fixed for MongoDB storage)
  const handleUploadReport = async (appointmentId, file) => {
    if (!file) return toast.error("Please select a file");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("reportFile", file);

    console.log("Uploading report for:", appointmentId);
    console.log("Selected file:", file.name);

    try {
      const res = await axios.post(
        `${backendURL}/api/appointments/upload-report/${appointmentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Upload response:", res.data);
      toast.success("Report uploaded successfully");

      // 🧠 Since you are storing the report inside MongoDB,
      // there is no real file URL — so we simulate a view link using appointment ID.
      const newUrl =
        res.data.reportUrl ||
        `/api/appointments/view-report/${appointmentId}`;

      console.log("✅ Setting new reportUrl:", newUrl);

      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId ? { ...a, reportUrl: newUrl } : a
        )
      );

      console.log("✅ Updated appointments state after upload");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      toast.error("Upload failed. Please try again.");
    }
  };

  const handlePrint = (appointment) => {
    let medicineHTML = '';

    if (appointment.medicines?.length > 0) {
      const grouped = groupMedicinesByTiming(appointment.medicines);

      medicineHTML += '<strong>Medicines:</strong>';
      Object.entries(grouped).forEach(([timing, meds]) => {
        if (meds.length > 0) {
          const medListHTML = meds
            .map(
              (med) =>
                `<li><strong>${med.name}</strong> - ${med.dosage} (${med.frequency})</li>`
            )
            .join('');

          medicineHTML += `<p><u>${timing}:</u></p><ul>${medListHTML}</ul>`;
        }
      });
    }
    // ✅ Upload Patient Report


    const printContent = `
      <h3>Prescription Details</h3>
      <p><strong>Date:</strong> ${appointment.date}</p>
      <p><strong>Time:</strong> ${appointment.time}</p>
      <p><strong>Doctor:</strong> ${appointment.doctorId.name || appointment.doctorId}</p>
      <p><strong>Doctor's Notes:</strong> ${appointment.prescription || 'N/A'}</p>
      ${medicineHTML}
    `;

    const newWindow = window.open('', '_blank');
    newWindow.document.write(`<html><head><title>Prescription</title></head><body>${printContent}</body></html>`);
    newWindow.document.close();
    newWindow.print();
  };

  const statuses = ['All', 'Pending', 'Approved', 'In Progress', 'Rejected', 'Completed', 'Missed'];

  return (
    <div className="min-h-screen bg-gray-100 py-20">
      <div className="max-w-6xl mx-auto px-2">
        <h2 className="text-3xl font-bold text-violet-900 text-center mb-10">
          My Appointments
        </h2>

        {/* Filter Buttons */}
        <div className="flex justify-center flex-wrap gap-3 mb-8">
          {statuses.map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${active
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-violet-50"
                  }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Appointment Cards */}
        {loading ? (
          <p className="text-center text-gray-600">Loading appointments...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : filteredAppointments.length === 0 ? (
          <p className="text-center text-gray-600">
            No appointments found for this status.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAppointments.map((appointment) => (
              <article
                key={appointment._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 p-5"
              >
                <div className="text-gray-700 text-sm space-y-2">
                  <p>
                    <span className="font-semibold text-gray-900">Date:</span>{" "}
                    {appointment.date}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Time:</span>{" "}
                    {appointment.time}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Doctor:</span>{" "}
                    {appointment.doctorId?.name || appointment.doctorId}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Symptom:
                    </span>{" "}
                    {appointment.symptoms || "N/A"}
                  </p>

                  <div className="mt-2">
                    <StatusPill status={appointment.status} />
                  </div>
                  {/* ✅ Show Upload button for Approved appointments */}
                  {/* ✅ Upload or View Report for Approved Appointments */}
                  {/* ✅ Allow upload/view in Pending and Approved states */}
                  {["Pending", "Approved"].includes(appointment.status) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!appointment.reportUrl ? (
                        <label className="cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
                          Upload Report
                          <input
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={(e) =>
                              handleUploadReport(appointment._id, e.target.files[0])
                            }
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <>
                          <a
                            href={`${backendURL}/api/appointments/view-report/${appointment._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition"
                          >
                            View Report
                          </a>

                          <a
                            href={`${backendURL}/api/appointments/view-report/${appointment._id}`}
                            download={appointment._id + "_report.pdf"}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition"
                          >
                            Download Report
                          </a>
                        </>
                      )}
                    </div>
                  )}



                  {appointment.status === "Completed" && (
                    <>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => togglePrescription(appointment._id)}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition"
                        >
                          {openPrescriptions[appointment._id]
                            ? "Hide Prescription"
                            : "View Prescription"}
                        </button>

                        <button
                          onClick={() => handlePrint(appointment)}
                          className="px-3 py-1.5 rounded-md text-sm font-medium border border-violet-200 text-violet-700 hover:bg-violet-50 transition"
                        >
                          Download Prescription
                        </button>

                        {!submittedFeedbacks[appointment._id] ? (
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowModal(true);
                            }}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            📝 Leave Feedback
                          </button>
                        ) : (
                          <span className="text-emerald-700 text-sm font-medium">
                            ✓ Feedback submitted
                          </span>
                        )}
                      </div>

                      {openPrescriptions[appointment._id] && (
                        <div className="mt-4 border border-gray-100 rounded-lg bg-gray-50 p-4">
                          <p className="text-sm text-gray-700 mb-2">
                            <span className="font-semibold text-gray-900">
                              Doctor’s Notes:
                            </span>{" "}
                            {appointment.prescription || "N/A"}
                          </p>

                          {appointment.medicines?.length > 0 && (
                            <div className="space-y-3">
                              {Object.entries(
                                groupMedicinesByTiming(appointment.medicines)
                              ).map(([timing, meds]) =>
                                meds.length > 0 ? (
                                  <div key={timing}>
                                    <h4 className="text-sm font-semibold text-gray-900 underline mb-1">
                                      {timing}
                                    </h4>
                                    <ul className="list-disc list-inside text-gray-700 text-sm">
                                      {meds.map((med, idx) => (
                                        <li key={idx}>
                                          <strong>{med.name}</strong> -{" "}
                                          {med.dosage} ({med.frequency})
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : null
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {submittedFeedbacks[appointment._id] && (
                        <div className="mt-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <strong className="text-gray-900">Feedback</strong>
                            <div aria-hidden>
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`${i <
                                      (submittedFeedbacks[appointment._id]?.rating || 0)
                                      ? "text-amber-400"
                                      : "text-gray-300"
                                    }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="mt-2 text-gray-700 text-sm">
                            {submittedFeedbacks[appointment._id]?.comment
                              ? showFullFeedback[appointment._id]
                                ? submittedFeedbacks[appointment._id].comment
                                : submittedFeedbacks[appointment._id].comment.slice(
                                  0,
                                  120
                                ) +
                                (submittedFeedbacks[appointment._id].comment
                                  .length > 120
                                  ? "..."
                                  : "")
                              : "No comment provided."}
                          </p>
                          {submittedFeedbacks[appointment._id]?.comment?.length >
                            120 && (
                              <button
                                onClick={() =>
                                  setShowFullFeedback((prev) => ({
                                    ...prev,
                                    [appointment._id]:
                                      !prev[appointment._id],
                                  }))
                                }
                                className="mt-2 text-sm text-indigo-600 hover:underline"
                              >
                                {showFullFeedback[appointment._id]
                                  ? "Show less"
                                  : "Show more"}
                              </button>
                            )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {showModal && selectedAppointment && (
          <FeedbackModal
            show={showModal}
            onClose={() => setShowModal(false)}
            appointment={selectedAppointment}
            onFeedbackSubmitted={(id, feedback) => {
              setSubmittedFeedbacks((prev) => ({
                ...prev,
                [id]: {
                  comment: feedback.comment || "",
                  rating: feedback.rating || 0,
                },
              }));
              toast.success("Thank you for your feedback!");
            }}
          />

        )}
      </div>
    </div>
  );
};

export default PatientAppointments;

/* Status Pill Component */
const StatusPill = ({ status = "" }) => {
  const s = status.toLowerCase();
  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
  if (s.includes("pending"))
    return <span className={`${base} bg-yellow-100 text-yellow-800`}>{status}</span>;
  if (s.includes("approved"))
    return <span className={`${base} bg-emerald-100 text-emerald-800`}>{status}</span>;
  if (s.includes("progress"))
    return <span className={`${base} bg-amber-100 text-amber-800`}>{status}</span>;
  if (s.includes("rejected"))
    return <span className={`${base} bg-red-100 text-red-800`}>{status}</span>;
  if (s.includes("completed"))
    return <span className={`${base} bg-violet-100 text-violet-700`}>{status}</span>;
  if (s.includes("missed"))
    return <span className={`${base} bg-rose-100 text-rose-700`}>{status}</span>;

  return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
};

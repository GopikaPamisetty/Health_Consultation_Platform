import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";


const PendingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(""); // "Approved" or "Rejected"

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    const fetchPendingAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/appointments/appointments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAppointments(res.data);
      } catch (err) {
        toast.error(
          err.response?.data?.msg || "Failed to fetch pending appointments"
        );
      }
    };

    fetchPendingAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      setLoadingId(id);
      setLoadingAction(status);

      const token = localStorage.getItem("token");
      const payload = status === "Completed" ? { status, prescription, medicines } : { status };

      await axios.patch(
        `http://localhost:5000/api/appointments/update-status/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Appointment ${status.toLowerCase()} successfully`);
      setAppointments((prev) => prev.filter((appt) => appt._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update status");
    } finally {
      setLoadingId(null);
      setLoadingAction("");
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-indigo-800 flex justify-center items-center gap-2">
          🗓️ Pending Appointments
        </h2>
        <p className="text-gray-600 mt-1">{today}</p>
        <div className="w-24 mx-auto mt-2 border-b-4 border-indigo-500 rounded-lg"></div>
      </div>

      {/* Appointments Section */}
      {appointments.length === 0 ? (
        <p className="text-center text-gray-500 italic">
          No pending appointments at the moment.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 border border-indigo-100"
            >
              <div>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                  {appointment.patientName}
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Email:</strong> {appointment.email}
                  </p>
                  <p>
                    <strong>Date:</strong> {appointment.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {appointment.time}
                  </p>
                  <p>
                    <strong>Phone:</strong> {appointment.phone}
                  </p>
                  <p>
                    <strong>Gender:</strong> {appointment.gender}
                  </p>
                  <p>
                    <strong>Symptoms:</strong> {appointment.symptoms}
                  </p>
                </div>
                <span className="inline-block mt-3 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {appointment.status}
                </span>
              </div>
              {/* Buttons */}
              <div className="flex flex-col gap-3 mt-5">
                {/*  Report Buttons (if report exists) */}
                {appointment.reportFile && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        window.open(
                          `http://localhost:5000/api/appointments/view-report/${appointment._id}`,
                          "_blank"
                        )
                      }
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm"
                    >
                      View Report
                    </button>

                    <a
                      href={`http://localhost:5000/api/appointments/view-report/${appointment._id}`}
                      download={`report_${appointment._id}.pdf`}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-center text-sm"
                    >
                      Download Report
                    </a>
                  </div>
                )}

                {/*  Approve / Reject Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(appointment._id, "Approved")}
                    disabled={
                      (loadingId === appointment._id && loadingAction === "Approved") ||
                      (loadingId === appointment._id && loadingAction === "Rejected")
                    }
                    className={`flex-1 font-medium px-4 py-1.5 rounded-lg text-sm shadow transition ${loadingId === appointment._id && loadingAction === "Approved"
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                  >
                    {loadingId === appointment._id && loadingAction === "Approved"
                      ? "Approving..."
                      : "Approve"}
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(appointment._id, "Rejected")}
                    disabled={
                      (loadingId === appointment._id && loadingAction === "Approved") ||
                      (loadingId === appointment._id && loadingAction === "Rejected")
                    }
                    className={`flex-1 font-medium px-4 py-1.5 rounded-lg text-sm shadow transition ${loadingId === appointment._id && loadingAction === "Rejected"
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                  >
                    {loadingId === appointment._id && loadingAction === "Rejected"
                      ? "Rejecting..."
                      : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingAppointments;

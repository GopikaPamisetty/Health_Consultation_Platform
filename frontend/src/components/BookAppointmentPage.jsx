import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5000/api";

const timeSlots = [
  "09:00 am",
  "10:00 am",
  "11:00 am",
  "12:00 pm",
  "01:30 pm",
  "03:00 pm",
  "04:30 pm",
];

const BookAppointmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [document, setDocument] = useState(null);
  const [formData, setFormData] = useState({
    symptoms: "",
    phone: "",
    gender: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorRes = await axios.get(`${API_BASE}/doctors/${id}`);
        setDoctor(doctorRes.data);

        const bookedRes = await axios.get(
          `${API_BASE}/appointments/booked-slots/${id}`
        );
        setBookedSlots(bookedRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch doctor data.");
      }
    };
    fetchData();
  }, [id]);

  const handleSlotSelect = (slot) => setSelectedTime(slot);
  const isSlotBooked = (slot) =>
    selectedDate && bookedSlots.includes(`${selectedDate}|${slot}`);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time.");
      return;
    }
  
    try {
      setIsSubmitting(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        toast.error("Please login to book an appointment.");
        setIsSubmitting(false);
        return;
      }
  
      const formDataToSend = new FormData();
      formDataToSend.append("doctorId", doctor._id);
      formDataToSend.append("doctorName", doctor.name);
      formDataToSend.append("patientId", storedUser._id);
      formDataToSend.append("patientName", storedUser.name);
      formDataToSend.append("email", storedUser.email);
      formDataToSend.append("date", selectedDate);
      formDataToSend.append("time", selectedTime);
      formDataToSend.append("symptoms", formData.symptoms);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("gender", formData.gender);
      if (document) formDataToSend.append("document", document); // optional
  
      await axios.post(`${API_BASE}/appointments`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      toast.success("Appointment booked successfully!");
      navigate("/patient-dashboard");
    } catch (err) {
      console.error("Booking failed:", err);
      toast.error(err.response?.data?.msg || "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-start py-10 font-[Poppins]">
      <div className="bg-white w-full max-w-md shadow-xl rounded-2xl p-8 border border-indigo-100">
        {/* Back Button */}
        <button
          onClick={() => navigate("/patient-dashboard/doctors")}
          className="text-indigo-700 font-semibold text-sm mb-4 hover:underline"
        >
          ← Back to Doctors
        </button>

        {/* Doctor Details */}
        {doctor && (
          <div className="mb-8 text-center border-b pb-4">
            <h2 className="text-xl font-bold text-indigo-700">
              Dr. {doctor.name}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {doctor.specialization} • {doctor.degree}
            </p>
            <p className="text-indigo-800 font-medium text-sm mt-2 bg-indigo-50 px-3 py-1 inline-block rounded-md">
              Consultation Fee: ₹400 – ₹700
            </p>
          </div>
        )}

        {/* Appointment Form */}
        <h3 className="text-lg font-semibold text-indigo-800 mb-4 text-center">
          Book Appointment
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Select Date
            </label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Select Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleSlotSelect(slot)}
                  disabled={isSlotBooked(slot)}
                  className={`py-1.5 rounded-md text-[12px] font-medium border transition-all ${
                    isSlotBooked(slot)
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : selectedTime === slot
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Symptoms / Reason
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={(e) =>
                setFormData({ ...formData, symptoms: e.target.value })
              }
              required
              placeholder="Describe your symptoms..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
            />
          </div>
          {/* Optional Document Upload */}
<div>
  <label className="block text-gray-700 font-medium mb-1 text-sm">
    Upload Supporting Document (optional)
  </label>
  <input
    type="file"
    name="document" 
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={(e) => setDocument(e.target.files[0])}
    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
  />
</div>


          {/* Phone & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                pattern="[0-9]{10}"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                placeholder="10-digit number"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select --</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
  type="submit"
  disabled={isSubmitting}
  className={`w-full py-2 rounded-md text-sm font-semibold text-white transition-all ${
    isSubmitting
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
  }`}
>
  {isSubmitting ? "Confirming..." : "Confirm Appointment"}
</button>

        </form>
      </div>
    </div>
  );
};

export default BookAppointmentPage;

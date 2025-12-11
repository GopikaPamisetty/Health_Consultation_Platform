import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "https://health-consultation-platform.onrender.com/api/lab";

const PatientBookLab = () => {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState("");
  const [labTests, setLabTests] = useState([]);
  const [formData, setFormData] = useState({
    testName: "",
    description: "",
    appointmentDate: "", 
  });

  const token = localStorage.getItem("token");
  const patientId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(`${API_BASE}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setLabs(res.data))
      .catch(() => toast.error("Failed to load labs"));
  }, [token]);

  useEffect(() => {
    if (selectedLab) {
      axios
        .get(`${API_BASE}/tests/${selectedLab}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setLabTests(res.data))
        .catch(() => {
          toast.error("Failed to load tests");
          setLabTests([]);
        });
    } else {
      setLabTests([]);
    }
  }, [selectedLab, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLab || !formData.testName || !formData.appointmentDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        labId: selectedLab,
        testName: formData.testName,
        description: formData.description,
        patientId: patientId,
        appointmentDate: formData.appointmentDate, // NEW
      };

      await axios.post(`${API_BASE}/book-test`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Lab test booked successfully!");

      setFormData({ testName: "", description: "", appointmentDate: "" });
      setSelectedLab("");
      setLabTests([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book lab test");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 flex justify-center items-center p-16">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">
          Book Lab Test
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Lab Dropdown */}
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            className="border p-2 rounded-lg shadow-sm"
            required
          >
            <option value="">-- Select Lab --</option>
            {labs.map((lab) => (
              <option key={lab._id} value={lab._id}>
                {lab.name}
              </option>
            ))}
          </select>

          {/* Test Dropdown */}
          <select
            value={formData.testName}
            onChange={(e) =>
              setFormData({ ...formData, testName: e.target.value })
            }
            className="border p-2 rounded-lg shadow-sm"
            required
            disabled={!labTests.length}
          >
            <option value="">
              {labTests.length ? "-- Select Test --" : "Select a lab first"}
            </option>
            {labTests.map((test, idx) => (
              <option key={idx} value={test}>
                {test}
              </option>
            ))}
          </select>

          {/* Appointment Date */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Select Appointment Date:
            </label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) =>
                setFormData({ ...formData, appointmentDate: e.target.value })
              }
              className="border p-2 rounded-lg shadow-sm w-full"
              required
            />
          </div>

          {/* Description */}
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border p-2 rounded-lg shadow-sm"
          />

          {/* Submit */}
          <button
            type="submit"
            className="bg-indigo-600 text-white py-3 rounded-xl shadow hover:bg-indigo-700 transition"
          >
            Book Test
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientBookLab;

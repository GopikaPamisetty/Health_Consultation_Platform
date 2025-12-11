import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaBars } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "react-toastify/dist/ReactToastify.css";

const COLORS = ["#2563eb", "#10b981", "#fbbf24", "#ef4444", "#8b5cf6"];

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [appointmentsOverTime, setAppointmentsOverTime] = useState([]);
  const [doctorSpecializations, setDoctorSpecializations] = useState([]);
  const [allFeedbacks, setAllFeedbacks] = useState([]);

  const backendURL = "http://localhost:5000";

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${backendURL}/api/admin/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.doctors || res.data.data || [];
      setDoctors(data);
    } catch {
      toast.error("Failed to fetch doctors");
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `${backendURL}/api/admin/approve-doctor/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Doctor approved!");
      fetchDoctors();
    } catch (error) {
      toast.error("Approval failed");
      console.error(error.response?.data || error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Logged out!");
    setTimeout(() => navigate("/admin/login"), 1000);
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const [statsRes, appointmentsRes, specializationsRes] = await Promise.all([
        axios.get(`${backendURL}/api/admin/analytics/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendURL}/api/admin/analytics/appointments-over-time`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendURL}/api/admin/analytics/doctor-specializations`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(statsRes.data);
      setAppointmentsOverTime(appointmentsRes.data);
      setDoctorSpecializations(specializationsRes.data);
    } catch {
      toast.error("Failed to fetch analytics data");
    }
  };

  const fetchAllFeedbacks = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${backendURL}/api/admin/analytics/all-feedbacks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllFeedbacks(res.data);
    } catch {
      toast.error("Failed to fetch feedbacks");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "feedback") fetchAllFeedbacks();
  }, [activeTab]);

  const approvedDoctors = doctors.filter((doc) => doc.isApproved);
  const pendingDoctors = doctors.filter((doc) => !doc.isApproved);

  const renderTable = (doctorList) => (
    <div className="overflow-x-auto shadow rounded-lg bg-white p-4">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Specialization</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Status</th>
            {!doctorList.every((d) => d.isApproved) && <th className="px-4 py-2">Action</th>}
          </tr>
        </thead>
        <tbody>
          {doctorList.map((doc) => (
            <tr key={doc._id} className="border-b hover:bg-gray-50 transition">
              <td className="px-4 py-2">{doc.name}</td>
              <td className="px-4 py-2">{doc.specialization || "N/A"}</td>
              <td className="px-4 py-2">{doc.email}</td>
              <td className="px-4 py-2">
                {doc.isApproved ? (
                  <span className="text-green-600 font-medium">Approved</span>
                ) : (
                  <span className="text-yellow-600 font-medium">Pending</span>
                )}
              </td>
              {!doc.isApproved && (
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleApprove(doc._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md transition"
                  >
                    Approve
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnalytics = () => {
    if (!stats)
      return <p className="text-gray-600 text-center mt-10">Loading analytics...</p>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Patients", value: stats.totalPatients },
            { label: "Total Doctors", value: stats.totalDoctors },
            { label: "Appointments", value: stats.totalAppointments },
            { label: "Approved Doctors", value: stats.approvedDoctors },
            { label: "Pending Doctors", value: stats.notApprovedDoctors },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
              <h3 className="text-gray-500 text-sm">{item.label}</h3>
              <p className="text-2xl font-semibold mt-2 text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-gray-700 mb-2 font-medium">Appointments Over Time</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={appointmentsOverTime}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-gray-700 mb-2 font-medium">Doctor Specializations</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={doctorSpecializations}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {doctorSpecializations.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedback = () => {
    if (!allFeedbacks.length)
      return <p className="text-center text-gray-500 mt-10">No feedback yet</p>;

    return (
      <div className="grid md:grid-cols-2 gap-4">
        {allFeedbacks.map((fb, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-lg font-semibold text-blue-700">
              {fb.doctorName}{" "}
              <span className="text-gray-500 text-sm">({fb.specialization})</span>
            </h4>
            <p className="text-sm text-gray-600">Patient: {fb.patientName}</p>
            <div className="flex mt-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < fb.rating ? "text-yellow-400" : "text-gray-300"}>
                  ★
                </span>
              ))}
            </div>
            {fb.comment && <p className="mt-2 text-gray-700 italic">"{fb.comment}"</p>}
            <p className="text-xs text-gray-400 mt-2">
              {new Date(fb.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm flex flex-wrap items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-3">
          <FaBars
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-2xl text-gray-700 cursor-pointer md:hidden"
          />
          <h2 className="text-xl font-semibold text-[#1e293b]">
            MediTrack <span className="text-blue-600 font-bold">Admin</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
          {[
            { key: "pending", label: "Pending" },
            { key: "approved", label: "Approved" },
            { key: "analytics", label: "Analytics" },
            { key: "feedback", label: "Feedback" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          Logout
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 capitalize">
          {activeTab === "analytics"
            ? "Analytics Overview"
            : activeTab === "feedback"
              ? "Feedback & Ratings"
              : `${activeTab} Doctors`}
        </h1>

        {activeTab === "pending" && renderTable(pendingDoctors)}
        {activeTab === "approved" && renderTable(approvedDoctors)}
        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "feedback" && renderFeedback()}

        <ToastContainer position="top-right" autoClose={2000} />
      </main>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DoctorNavbar from "./DoctorNavbar";
import {
  FaUserMd,
  FaCalendarAlt,
  FaClipboardList,
  FaComments,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";

const DoctorDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardRoot = location.pathname === "/doctor-dashboard";
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    const loadDoctor = () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData && userData.name) {
          setDoctorName(userData.name);
        } else {
          setDoctorName("Doctor");
        }
      } catch (err) {
        console.error("Error reading user from localStorage:", err);
        setDoctorName("Doctor");
      }
    };

    loadDoctor();

    // Try again after short delay if data not yet available
    const timer = setTimeout(() => {
      if (!doctorName) loadDoctor();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);


  //  Reusable Dashboard Card
  const DashboardCard = ({ icon: Icon, title, desc, color, onClick }) => (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-2xl p-6 shadow-md hover:shadow-xl cursor-pointer transform hover:-translate-y-2 transition-all duration-300 group`}
    >
      {/* Soft Gradient Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-25 transition-opacity`}
      ></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          className={`p-4 rounded-full mb-3 bg-gradient-to-br ${color} text-white shadow-md`}
        >
          <Icon size={28} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-snug">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col font-[Segoe_UI]">
      {/* 🔹 Navbar */}
      <DoctorNavbar />

      {/* 🔹 Main Content */}
      <main className="flex-1 px-6 py-10 md:px-4 mt-2">
        {isDashboardRoot ? (
          <div className="max-w-6xl mx-auto animate-fadeIn">
            {/* Header Section */}
            <div className="bg-white rounded-3xl shadow-lg p-10 text-center mb-12 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-40"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-40"></div>

              <h2 className="text-4xl font-extrabold text-indigo-700 mb-3">
                Welcome,{" "}
                <span className="text-indigo-800 capitalize">
                  Dr. {doctorName.split(" ")[1] || "Doctor"} 👩‍⚕️
                </span>
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                Manage your{" "}
                <span className="text-indigo-600 font-semibold">profile</span>,
                track{" "}
                <span className="text-indigo-600 font-semibold">
                  appointments
                </span>
                , monitor{" "}
                <span className="text-indigo-600 font-semibold">feedback</span>,
                and analyze your{" "}
                <span className="text-indigo-600 font-semibold">
                  performance
                </span>{" "}
                — all from one dashboard.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-28 bg-indigo-500 rounded-full"></div>
              </div>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <DashboardCard
                icon={FaUserMd}
                title="My Profile"
                desc="Update your professional info and specialization."
                color="from-indigo-500 to-indigo-700"
                onClick={() => navigate("/doctor-dashboard/doctor-profile")}
              />
              <DashboardCard
                icon={FaCalendarAlt}
                title="Pending Appointments"
                desc="View and manage pending patient requests."
                color="from-blue-500 to-blue-700"
                onClick={() => navigate("/doctor-dashboard/appointments")}
              />
              <DashboardCard
                icon={FaClipboardList}
                title="My Appointments"
                desc="Check your confirmed and upcoming appointments."
                color="from-teal-500 to-cyan-600"
                onClick={() => navigate("/doctor-dashboard/my-appointments")}
              />
              <DashboardCard
                icon={FaComments}
                title="Feedback Summary"
                desc="Read what patients think about your consultations."
                color="from-green-500 to-green-700"
                onClick={() => navigate("/doctor-dashboard/doctor-feedback")}
              />
              <DashboardCard
                icon={FaCheckCircle}
                title="Approval Status"
                desc="Track your registration and verification status."
                color="from-orange-500 to-red-600"
                onClick={() => navigate("/doctor-dashboard/approval-status")}
              />
              <DashboardCard
                icon={FaChartLine}
                title="Performance Analytics"
                desc="Analyze your consultation trends and success rate."
                color="from-purple-500 to-purple-700"
                onClick={() => navigate("/doctor-dashboard/analytics")}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto animate-fadeIn">
            <Outlet />
          </div>
        )}
      </main>

      {/* 🔹 Footer */}
      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500 mt-8">
        © {new Date().getFullYear()} Health Consultation — Empowering Doctors
        Digitally
      </footer>
    </div>
  );
};

export default DoctorDashboardLayout;

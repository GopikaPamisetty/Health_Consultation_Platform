import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  User,
  BarChart,
  MessageSquare,
  ClipboardList,
  CheckCircle,
  Menu,
  X,
  LogOut,
  Stethoscope,
} from "lucide-react";

const DoctorNavbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Profile", icon: <User size={18} />, path: "/doctor-dashboard/doctor-profile" },
    { label: "Feedback", icon: <MessageSquare size={18} />, path: "/doctor-dashboard/doctor-feedback" },
    { label: "Pending", icon: <ClipboardList size={18} />, path: "/doctor-dashboard/appointments" },
    { label: "My Appointments", icon: <ClipboardList size={18} />, path: "/doctor-dashboard/my-appointments" },
    { label: "Analytics", icon: <BarChart size={18} />, path: "/doctor-dashboard/analytics" },
    { label: "Approval", icon: <CheckCircle size={18} />, path: "/doctor-dashboard/approval-status" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => navigate("/doctor-dashboard")}
          className="flex items-center gap-2 text-indigo-700 font-extrabold text-xl cursor-pointer tracking-tight hover:text-indigo-600 transition-all"
        >
          <Stethoscope size={26} className="text-indigo-600" />
          <span className="flex items-center">
            Health<span className="text-indigo-500">Consultation</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(({ label, icon, path }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-1.5 rounded-md text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? "text-indigo-700 bg-indigo-100"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}

          {/* Logout Button (Desktop) */}
          <button
            onClick={handleLogout}
            className="ml-4 flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-indigo-700 hover:text-indigo-600 transition-all"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-md animate-fadeIn">
          <nav className="flex flex-col p-4 space-y-3">
            {navItems.map(({ label, icon, path }) => (
              <NavLink
                key={label}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 text-[15px] font-medium p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                {icon}
                {label}
              </NavLink>
            ))}

            {/* ✅ Mobile Logout (Centered & Inside Menu) */}
            <div className="flex justify-center pt-4 border-t border-gray-100 mt-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white w-full py-2 rounded-lg text-sm font-semibold transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default DoctorNavbar;

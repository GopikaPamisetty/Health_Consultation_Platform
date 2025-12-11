import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { User, CalendarDays, HeartPulse, LogOut, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const PatientNavbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { label: "Profile", icon: <User className="w-4 h-4" />, path: "/patient-dashboard/profile" },
    { label: "Appointments", icon: <CalendarDays className="w-4 h-4" />, path: "/patient-dashboard/appointments" },
    { label: "My Doctors", icon: <HeartPulse className="w-4 h-4" />, path: "/patient-dashboard/doctors" },
    { label: "BookLabTest", icon: <HeartPulse className="w-4 h-4" />, path: "/patient-dashboard/patientBookLab" },
    { label: "Lab Tests", icon: <HeartPulse className="w-4 h-4" />, path: "/patient-dashboard/lab-tests" },

  ];

  return (
    <nav className="bg-white text-gray-800 shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo Section */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/patient-dashboard/profile")}
        >
          <img src={logo} alt="Logo" className="w-9 h-9 rounded-full" />
          <h1 className="text-lg md:text-xl font-bold tracking-wide text-violet-700">
            Health <span className="text-violet-900">Consult</span>
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map(({ label, icon, path }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 font-medium transition ${isActive
                  ? "text-violet-700 border-b-2 border-violet-700 pb-1"
                  : "text-gray-800 hover:text-violet-700"
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-violet-700 hover:text-violet-900 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg flex flex-col px-6 py-3 space-y-4">
          {navItems.map(({ label, icon, path }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 text-base font-medium ${isActive ? "text-violet-700" : "text-gray-800 hover:text-violet-700"
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {icon}
              {label}
            </NavLink>
          ))}

          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-3 text-base font-medium text-red-600 hover:text-red-700 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default PatientNavbar;

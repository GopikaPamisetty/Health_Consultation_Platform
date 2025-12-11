import React from "react";
import PatientNavbar from "./PatientNavbar";
import { Outlet } from "react-router-dom";

const PatientDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
      {/* Navbar */}
      <PatientNavbar />

      {/* Dashboard Content */}
      <div className="text-center px-7 py-10 pb-12">
        <Outlet>
          <h2 className="text-[28px] font-semibold text-gray-900 mb-3">
            Welcome to your Patient Dashboard
          </h2>
          <p className="text-[18px] text-gray-600">
            You can now browse doctors, book appointments, and manage your medical profile.
          </p>
        </Outlet>
      </div>
    </div>
  );
};

export default PatientDashboard;

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './components/HomePage';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import DoctorProfile from './components/DoctorProfile';
import PatientProfile from './components/PatientProfile';
import DoctorsPage from './components/PatientDoctors';
import PatientDashboard from './components/PatientDashboard';
import PendingAppointments from './components/PendingAppointments';
import BookAppointmentPage from './components/BookAppointmentPage';
import DoctorDashboardLayout from './components/DoctorDashboardLayout';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import DoctorAnalytics from './components/DoctorAnalytics';
import PatientDoctors from './components/PatientDoctors';
import ApprovalStatus from './components/ApprovalStatus';
import DoctorFeedbackSummary from './components/DoctorFeedbackSummary';
import PatientAppointments from './components/PatientAppointments';
import DoctorAppointments from './components/DoctorAppointments';
import Chatbot from './components/Chatbot';
import LabDashboard from "./components/LabDashboard";
import LabProfile from "./components/LabProfile";
import LabTestRequests from "./components/LabTestRequests";
import PatientBookLab from "./components/PatientBookLab";
import PatientLabTests from "./components/PatientLabTests";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />
      <Chatbot />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm onLogin={setUser} />} />
        <Route path="/doctors" element={<div className="min-h-screen bg-gray-50"><DoctorsPage /></div>} />
        <Route path="/appointment/:id" element={<BookAppointmentPage />} />
        <Route path="/doctors/approved" element={<PatientDoctors user={user} />} />


        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Patient Routes */}
        <Route path="/patient-dashboard" element={<PatientDashboard user={user} />} />
        <Route path="/patient-profile" element={<PatientProfile user={user} />} />
        <Route path="/patient-dashboard" element={<PatientDashboard user={user} />}>
          <Route index element={<PatientProfile user={user} />} />
          <Route path="profile" element={<PatientProfile user={user} />} />
          <Route path="appointments" element={<PatientAppointments user={user} />} />
          <Route path="doctors" element={<PatientDoctors user={user} />} />
          <Route path="patientBookLab" element={<PatientBookLab />} />
          <Route path="/patient-dashboard/lab-tests" element={<PatientLabTests />} />
        </Route>

        {/* Doctor Routes */}

        <Route path="/doctor-dashboard" element={<DoctorDashboardLayout user={user} />} >
          <Route path="doctor-profile" element={<DoctorProfile user={user} />} />
          <Route path="appointments" element={<PendingAppointments user={user} />} />
          <Route path="my-appointments" element={<DoctorAppointments user={user} />} />
          <Route path="doctor-feedback" element={<DoctorFeedbackSummary />} />
          <Route path="approval-status" element={<ApprovalStatus user={user} />} />
          <Route path="appointments/status/patient" element={<PatientAppointments user={user} />} />
          <Route path="/doctor-dashboard/analytics" element={<DoctorAnalytics />} />
        </Route>


        {/* Fallback Route */}
        <Route path="*" element={<LoginForm onLogin={setUser} />} />

        <Route path="/lab-dashboard" element={<LabDashboard />} />
        <Route path="/lab-profile" element={<LabProfile />} />
        <Route path="/lab-test-request" element={<LabTestRequests />} />
      </Routes>
    </Router>
  );
}

export default App;
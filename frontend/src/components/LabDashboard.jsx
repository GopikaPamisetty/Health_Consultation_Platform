import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiLogOut, FiFileText, FiUser, FiFolderPlus } from "react-icons/fi";

const LabDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleUpload = async (file, testId) => {
    if (!file || !testId) {
      toast.error("File or Test ID missing");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${backendURL}/api/lab/upload-result/${testId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("File uploaded successfully!");
      console.log(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-lg border border-gray-200">

        {/* Header */}
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-1 text-center">
          Welcome, {user?.name || "Lab"} 👋
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {user?.email}
        </p>

        {/* Button Group */}
        <div className="space-y-4">

          <button
            onClick={() => navigate("/lab-test-request")}
            className="flex items-center justify-center gap-3 bg-indigo-600 text-white py-3 w-full rounded-xl text-lg font-medium shadow-md hover:bg-indigo-700 transition-all"
          >
            <FiFolderPlus size={20} />
            View Test Requests
          </button>

          <button
            onClick={() => navigate("/lab-profile")}
            className="flex items-center justify-center gap-3 bg-blue-600 text-white py-3 w-full rounded-xl text-lg font-medium shadow-md hover:bg-blue-700 transition-all"
          >
            <FiUser size={20} />
            View Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 bg-red-500 text-white py-3 w-full rounded-xl text-lg font-medium shadow-md hover:bg-red-600 transition-all"
          >
            <FiLogOut size={20} />
            Logout
          </button>

        </div>
      </div>
    </div>
  );
};

export default LabDashboard;

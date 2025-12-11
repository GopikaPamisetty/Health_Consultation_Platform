import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); //  added
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent multiple clicks
    setLoading(true); //  show "Logging in..."

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log("Backend data:", data);
      console.log("User from backend:", data.user);
      console.log("Role from backend:", data.user?.role);
      console.log("User from localStorage:", JSON.parse(localStorage.getItem("user")));

      if (res.ok) {
        toast.success("Login successful!");

        // Save token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user._id); // optional

        console.log("User saved to localStorage:", JSON.parse(localStorage.getItem("user")));

        onLogin && onLogin(data.user);

        const userRole = data.user.role || ""; // get role from backend
        setTimeout(() => {
          if (userRole === "doctor") navigate("/doctor-dashboard");
          else if (userRole === "patient") navigate("/patient-dashboard");
          else if (userRole === "lab") navigate("/lab-dashboard");
          else navigate("/"); // fallback
        }, 1000);



      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false); //  stop showing "Logging in..."
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      {/* Square Login Box */}
      <div className="w-96 h-[30rem] bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col justify-between">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-violet-700 leading-tight">
            Health <span className="text-indigo-900">Consultation</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Online health consultation
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Email */}
          {/* <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div> */}

          {/* Password
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 cursor-pointer text-sm"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div> */}
          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Select Role</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="lab">Lab</option>
            </select>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 cursor-pointer text-sm"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>


          {/* Forgot Password */}
          <div className="text-right text-xs">
            <Link
              to="/forgot-password"
              className="text-violet-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md font-semibold text-sm transition duration-300 ${loading
                ? "bg-violet-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-violet-700 to-indigo-700 text-white hover:opacity-90"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-2 text-xs text-gray-600 space-y-1">
          <p>
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-violet-700 hover:underline font-medium"
            >
              Register
            </Link>
          </p>
          <a href="/" className="text-violet-700 hover:underline font-medium">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

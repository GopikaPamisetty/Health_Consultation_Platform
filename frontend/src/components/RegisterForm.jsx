import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // 👈 new state for loading

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      // ✅ Add console logs for debugging
      console.log("Backend response object:", res);
      console.log("Backend data:", data);
      console.log("User from backend:", data.user);
      console.log("Role from backend:", data.user?.role);
      console.log(
        "User from localStorage:",
        JSON.parse(localStorage.getItem("user"))
      );

      if (res.ok) {
        toast.success("Registration successful! You can now login.");
        setFormData({ name: "", email: "", password: "", role: "patient" });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false); // 👈 stop showing "Registering..."
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-300">
      {/* Compact Centered Box */}
      <div className="w-[24rem] bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col items-center">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-5">
          Create Account
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          {/* Name */}
          <label className="block mb-2 text-gray-700 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full mb-3 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Email */}
          <label className="block mb-2 text-gray-700 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="yourname@gmail.com"
            onChange={handleChange}
            required
            className="w-full mb-3 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Password */}
          <label className="block mb-2 text-gray-700 font-medium">Password</label>
          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600 text-base"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          {/* Role */}
          <label className="block mb-2 text-gray-700 font-medium">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full mb-5 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="lab">Lab</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-semibold text-base transition ${loading
                ? "bg-blue-300 cursor-not-allowed text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-700 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

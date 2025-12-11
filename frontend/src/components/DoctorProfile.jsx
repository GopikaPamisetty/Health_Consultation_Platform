import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUserMd, FaEdit, FaPhoneAlt, FaSignOutAlt } from "react-icons/fa";

const DoctorProfile = ({ user }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formState, setFormState] = useState({
    specialization: "",
    experience: "",
    bio: "",
    timings: "",
    isAvailable: true,
    onLeave: false,
    phone: "",
    image: null,
  });
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendURL}/api/doctors/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProfileData(data);
        setFormState((prev) => ({
          ...prev,
          specialization: data.specialization || "",
          experience: data.experience || "",
          bio: data.bio || "",
          timings: data.timings || "",
          isAvailable: data.isAvailable ?? true,
          onLeave: data.onLeave ?? false,
          phone: data.phone || "",
        }));
        setPreviewImage(data.imageUrl);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setFormState((prev) => ({ ...prev, image: reader.result }));
        setPreviewImage(reader.result);
      };

      if (file) reader.readAsDataURL(file);
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const updatedProfile = {
        specialization: formState.specialization,
        experience: formState.experience,
        bio: formState.bio,
        phone: formState.phone,
        isAvailable: formState.isAvailable,
        onLeave: formState.onLeave,
        timings: formState.timings,
        imageUrl: formState.image || profileData.imageUrl,
      };

      const res = await fetch(`${backendURL}/api/doctors/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      });

      const data = await res.json();

      if (res.ok) {
        setProfileData(data);
        setShowForm(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Profile update failed.");
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Unexpected error occurred. Try again.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg animate-pulse">
        Loading your profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 text-center md:text-left">
          <h2 className="text-3xl font-bold text-indigo-800 flex items-center gap-2">
            <FaUserMd className="text-indigo-600" /> Doctor Profile
          </h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm md:text-base transition duration-300 shadow-md"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* Basic Info - enhanced to show all fields */}
        {profileData && !showForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-8">
            {/* Left: avatar + quick stats */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="relative">
                <img
                  src={previewImage || profileData.imageUrl || "/default-avatar.png"}
                  alt="Doctor"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-300 shadow-lg"
                />
                <button
                  onClick={() => setShowForm(true)}
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 shadow-md hover:bg-indigo-700 transition"
                  title="Edit profile"
                >
                  <FaEdit />
                </button>
              </div>

              <div className="text-center md:text-left">
                <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              {/* availability badges */}
              <div className="flex gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    profileData.isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {profileData.isAvailable ? "Open to Work" : "Not Available"}
                </span>

                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    profileData.onLeave ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {profileData.onLeave ? "On Leave" : "Active"}
                </span>
              </div>
            </div>

            {/* Middle: core details */}
            <div className="md:col-span-2 bg-white/60 rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Specialization</p>
                  <p className="text-base font-semibold text-gray-800">
                    {profileData.specialization || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase">Experience</p>
                  <p className="text-base font-semibold text-gray-800">
                    {profileData.experience ? `${profileData.experience} years` : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone</p>
                  <p className="text-base text-gray-800">{profileData.phone || "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase">Timings</p>
                  <p className="text-base text-gray-800">{profileData.timings || "—"}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 uppercase">About / Bio</p>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                  {profileData.bio?.trim() ? profileData.bio : "No bio provided."}
                </p>
              </div>

              {/* Optional fields if present */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profileData.qualifications && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Qualifications</p>
                    <p className="text-gray-800">{profileData.qualifications}</p>
                  </div>
                )}
                {profileData.clinicAddress && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Clinic Address</p>
                    <p className="text-gray-800">{profileData.clinicAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Form (unchanged) */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-indigo-50/70 p-6 rounded-2xl border border-indigo-100 shadow-inner"
          >
            <div className="col-span-2 text-xl font-semibold text-indigo-800 mb-2">
              Edit Profile
            </div>

            <input
              type="text"
              name="specialization"
              value={formState.specialization}
              onChange={handleChange}
              placeholder="Specialization"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
            <input
              type="number"
              name="experience"
              value={formState.experience}
              onChange={handleChange}
              placeholder="Experience (years)"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
            <input
              type="tel"
              name="phone"
              value={formState.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
            <input
              type="text"
              name="timings"
              value={formState.timings}
              onChange={handleChange}
              placeholder="Available Timings (e.g. 9am - 5pm)"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />

            <textarea
              name="bio"
              value={formState.bio}
              onChange={handleChange}
              placeholder="Short Bio"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none col-span-2"
              required
            />

            <div className="col-span-2">
              <label className="block text-gray-700 font-medium mb-1">
                Profile Picture:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              {previewImage && (
                <div className="flex justify-center mt-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-300 shadow"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 col-span-2 justify-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formState.isAvailable}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600"
                />
                <span>Open to Work</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="onLeave"
                  checked={formState.onLeave}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600"
                />
                <span>Currently on Leave</span>
              </label>
            </div>

            <div className="col-span-2 flex justify-center gap-4 mt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;

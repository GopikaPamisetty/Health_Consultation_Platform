import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaUser, FaEdit, FaPhoneAlt, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PatientProfile = ({ user }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    bio: "",
    image: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendURL}/api/auth/profile/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        setProfile(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          age: data.age || "",
          gender: data.gender || "",
          bio: data.bio || "",
          image: null,
        });
        setPreviewImage(data.imageUrl);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((p) => ({ ...p, image: reader.result }));
        setPreviewImage(reader.result);
      };
      if (file) reader.readAsDataURL(file);
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const updated = {
        name: form.name,
        phone: form.phone,
        age: form.age,
        gender: form.gender,
        bio: form.bio,
        imageUrl: form.image || profile.imageUrl,
      };

      const res = await fetch(`${backendURL}/api/auth/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Profile updated!");
        setProfile((prev) => ({
          ...prev,
          ...updated,
        }));
        setShowForm(false);
      }
      else {
        toast.error(data.message || "Failed to update");
      }
    } catch (err) {
      toast.error("Update failed");
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-16">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <FaUser /> Patient Profile
          </h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {!showForm ? (
          <div>
            <div className="flex flex-col items-center mb-4">
              <img
                src={previewImage || "/default-avatar.png"}
                className="w-28 h-28 rounded-full border-4 border-green-300 shadow-md"
              />
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 bg-green-600 text-white px-4 py-1 rounded-lg"
              >
                <FaEdit /> Edit
              </button>
            </div>
            <div className="space-y-2 text-center">
              <p><b>Name:</b> {profile.name}</p>
              <p><b>Email:</b> {profile.email}</p>
              <p><b>Phone:</b> {profile.phone || "—"}</p>
              <p><b>Age:</b> {profile.age || "—"}</p>
              {/* <p><b>Gender:</b> {profile.gender || "—"}</p>
              <p><b>Bio:</b> {profile.bio || "No bio added"}</p> */}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded" />
            <input name="age" value={form.age} onChange={handleChange} placeholder="Age" className="border p-2 rounded" />
            {/* <input name="gender" value={form.gender} onChange={handleChange} placeholder="Gender" className="border p-2 rounded" />
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" className="border p-2 rounded" /> */}
            <input type="file" accept="image/*" onChange={handleChange} />
            {previewImage && <img src={previewImage} className="w-24 h-24 rounded-full mx-auto" />}
            <div className="flex gap-4 justify-center">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;

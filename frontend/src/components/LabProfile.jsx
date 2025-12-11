import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LabProfile = () => {
  const [lab, setLab] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLabProfile = async () => {
      if (!token) return navigate("/login");
      try {
        const res = await fetch("http://localhost:5000/api/lab/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || "Failed to fetch lab profile");
          return;
        }
        setLab(data);
        setFormData({
          name: data.name,
          contact: data.contact || "",
          address: data.address || "",
          tests: data.tests || [],
        });
      } catch (err) {
        toast.error("Error: " + err.message);
      }
    };
    fetchLabProfile();
  }, [navigate, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle tests array changes
  const handleTestChange = (index, value) => {
    const newTests = [...formData.tests];
    newTests[index] = value;
    setFormData((prev) => ({ ...prev, tests: newTests }));
  };

  const addTest = () => {
    setFormData((prev) => ({ ...prev, tests: [...prev.tests, ""] }));
  };

  const removeTest = (index) => {
    const newTests = formData.tests.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, tests: newTests }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/lab/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update profile");
        return;
      }
      toast.success("Profile updated successfully");
      setLab(data);
      setEditMode(false);
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  if (!lab) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-indigo-700 mb-4">Lab Profile</h1>

        <div className="text-gray-700 space-y-3">
          <div>
            <strong>Name:</strong>{" "}
            {editMode ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              lab.name
            )}
          </div>

          <div>
            <strong>Email:</strong> {lab.email}
          </div>

          <div>
            <strong>Contact:</strong>{" "}
            {editMode ? (
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              lab.contact || "Not provided"
            )}
          </div>

          <div>
            <strong>Address:</strong>{" "}
            {editMode ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border p-1 rounded w-full mt-1"
              />
            ) : (
              lab.address || "Not provided"
            )}
          </div>

          {/* Tests Section */}
          <div>
            <strong>Tests:</strong>
            {editMode ? (
              <div className="space-y-2 mt-1">
                {formData.tests.map((test, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={test}
                      onChange={(e) => handleTestChange(index, e.target.value)}
                      className="border p-1 rounded flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeTest(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTest}
                  className="bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700 mt-2"
                >
                  Add Test
                </button>
              </div>
            ) : lab.tests.length ? (
              <ul className="list-disc list-inside mt-1">
                {lab.tests.map((test, idx) => (
                  <li key={idx}>{test}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">No tests added</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-between">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {!editMode && (
          <button
            onClick={() => navigate("/lab-dashboard")}
            className="mt-3 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default LabProfile;

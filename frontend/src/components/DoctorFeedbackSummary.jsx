import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaUserCircle, FaComments } from "react-icons/fa";

const DoctorFeedbackSummary = () => {
  const [averageRating, setAverageRating] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchFeedbackSummary = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/feedback/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data || [];
        const avg = data.reduce((sum, f) => sum + f.rating, 0) / (data.length || 1);
        setAverageRating(avg.toFixed(1));
        setFeedbacks(data.slice(0, 3)); // show top 3 recent feedbacks
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchFeedbackSummary();
  }, [token]);

  if (loading)
    return (
      <p className="text-center mt-10 text-indigo-600 font-semibold animate-pulse">
        Loading feedback summary...
      </p>
    );

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-3xl bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-2xl shadow-lg text-center p-6 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <FaComments className="text-yellow-300" /> Doctor Feedback Summary
        </h2>
        <p className="text-sm md:text-base opacity-90">
          See what your patients say about their experience.
        </p>
      </div>

      {/* Average Rating Card */}
      <div className="bg-white/90 border border-gray-100 shadow-md rounded-xl p-5 w-full max-w-sm text-center mb-8 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Average Rating</h3>
        <div className="flex justify-center items-center gap-2 mb-2">
          <FaStar className="text-yellow-400 text-3xl animate-pulse" />
          <span className="text-3xl font-bold text-indigo-700">{averageRating}</span>
          <span className="text-gray-500">/5</span>
        </div>
        <p className="text-sm text-gray-500">Based on recent patient feedback</p>
      </div>

      {/* Feedback List */}
      <div className="w-full max-w-4xl">
        {feedbacks.length === 0 ? (
          <div className="bg-gray-50 text-center py-10 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 italic">
              No feedback received yet. Keep providing great care! 💜
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feedbacks.map((f, i) => (
              <div
                key={i}
                className="bg-white/90 rounded-xl shadow-md hover:shadow-lg border border-gray-100 p-5 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaUserCircle className="text-indigo-500 text-2xl" />
                    <span className="font-medium text-gray-800 text-sm md:text-base">
                      {f.patientId?.name || "Anonymous"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-lg" />
                    <span className="text-sm font-semibold text-gray-700">{f.rating}</span>
                  </div>
                </div>

                {f.comment?.trim() ? (
                  <p className="text-gray-600 italic text-sm md:text-base leading-relaxed">
                    “{f.comment}”
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm italic">No comment provided.</p>
                )}

                <div className="mt-3 text-xs text-gray-400 text-right">
                  {new Date(f.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorFeedbackSummary;

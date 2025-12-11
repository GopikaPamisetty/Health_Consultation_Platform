import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const FeedbackModal = ({ show, onClose, appointment, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
       `${backendURL}/api/feedback`,
        {
          appointmentId: appointment._id,
          doctorId: appointment.doctorId._id || appointment.doctorId,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Feedback submitted successfully!");
      onFeedbackSubmitted(appointment._id);
      onClose();
    } catch (err) {
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-3">
      {/* Modal Container */}
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-4">
          <h2 className="text-lg md:text-xl font-semibold tracking-wide">
            Share Your Feedback
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          
          {/* Rating Section */}
          <div className="text-center">
            <p className="font-medium text-gray-800 mb-3 text-sm md:text-base">
              How would you rate your experience?
            </p>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`text-3xl md:text-4xl transition-transform duration-200 ${
                      (hoverRating || rating) >= star
                        ? "text-yellow-400 scale-110"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              Rating: <span className="font-semibold">{rating} / 5</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mx-8">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">
              Your comments (optional)
            </label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            ></textarea>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-center gap-4 bg-gray-100 px-6 py-4 flex-wrap">
          <button
            onClick={onClose}
            className="border border-indigo-600 text-indigo-600 font-medium px-5 py-2 rounded-lg text-sm hover:bg-indigo-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
            } text-white px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2`}
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

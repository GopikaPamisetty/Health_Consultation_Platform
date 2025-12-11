import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { FaDownload } from "react-icons/fa";
import badge from "../assets/badge.png";
import isignature from "../assets/signature.png";

const ApprovalStatus = () => {
  const [doctor, setDoctor] = useState(null);
  const [status, setStatus] = useState(null);
  const [prevStatus, setPrevStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef(null);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  
  
  
  useEffect(() => {
    const fetchApproval = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${backendURL}/api/doctors/approval-status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { isApproved, name, email, imageUrl } = res.data;
        setDoctor({ name, email, imageUrl });

        const currentStatus = isApproved === true ? "approved" : "pending";
        setStatus(currentStatus);

        if (prevStatus === "pending" && currentStatus === "approved") {
          toast.success("🎉 You're now approved to consult patients!");
        }

        setPrevStatus(currentStatus);
      } catch (err) {
        console.error("Error fetching approval status:", err);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    fetchApproval();
  }, [prevStatus]);

  const handleDownload = async () => {
    const input = certificateRef.current;
    const button = input.querySelector("#download-btn");
    if (button) button.style.display = "none";
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${doctor.name}-Approval-Certificate.pdf`);

    if (button) button.style.display = "inline-flex";
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 text-lg animate-pulse">
        Loading...
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex justify-center items-center py-10 px-4">
      {status === "approved" ? (
        <div
          ref={certificateRef}
          className="bg-white border border-gray-200 shadow-2xl rounded-3xl p-10 sm:p-12 max-w-3xl text-center relative overflow-hidden transition-all duration-500 hover:shadow-indigo-300"
        >
          {/* Decorative gold ring effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50 opacity-50 rounded-3xl"></div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-900 mb-3 tracking-wide">
            Certificate of Approval
          </h1>
          <p className="text-lg text-gray-600 mb-6 font-medium">
            This certifies that
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-3">
            {doctor?.name}
          </h2>

          <img
            src={doctor?.imageUrl}
            alt="Doctor"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-200 shadow-lg"
          />

          <p className="text-lg sm:text-xl text-gray-800 mb-6">
            is officially approved by{" "}
            <strong className="font-semibold text-indigo-800">
              Health Consultation Pvt. Ltd.
            </strong>{" "}
            to consult patients and provide medical guidance.
          </p>

          <div className="my-4">
            <img src={badge} alt="Approval Badge" className="w-28 mx-auto" />
          </div>

          <div className="flex justify-between items-center mt-10 px-4 flex-wrap gap-6">
            <div className="text-left">
              <p className="text-sm text-gray-600">Issued by:</p>
              <p className="font-semibold text-gray-800">
                Health Consultation Pvt. Ltd.
              </p>
            </div>

            <div className="text-center">
              <img
                src={isignature}
                alt="Signature"
                className="h-12 mx-auto"
              />
              <p className="text-sm mt-1 font-semibold text-gray-700">
                Authorized Signatory
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              id="download-btn"
              onClick={handleDownload}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-6 py-3 font-semibold rounded-xl shadow-md inline-flex items-center gap-2 text-base transform transition-transform duration-200 hover:scale-105"
            >
              <FaDownload className="text-lg" />
              Download Certificate
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-8 border-yellow-400 shadow-lg p-8 rounded-2xl w-full max-w-xl text-center transition-all duration-300 hover:shadow-yellow-200">
          <h2 className="text-3xl font-bold text-yellow-600 mb-4">
            Approval Pending
          </h2>
          <p className="text-gray-700 text-lg mb-6">
            Your profile is currently under review by the{" "}
            <strong>Health Consultation</strong> admin team.
          </p>
          <ul className="text-left text-gray-700 list-disc pl-6 space-y-2 text-base">
            <li>Ensure your profile details are complete and accurate</li>
            <li>Upload a professional and clear profile image</li>
            <li>Provide all necessary experience details</li>
            <li>Wait for admin verification confirmation</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApprovalStatus;

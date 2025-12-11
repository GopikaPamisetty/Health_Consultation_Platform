import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const PatientLabTests = () => {
  const [tests, setTests] = useState([]);
  const [viewPdfUrl, setViewPdfUrl] = useState(null);
  const token = localStorage.getItem("token");
  const patientId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const fetchTests = async () => {
    setLoading(true);
    try {
      console.log("Fetching tests for patientId:", patientId);
      const res = await fetch(
       `${backendURL}/api/lab-tests/patient/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to fetch test requests");
        console.error("Fetch returned an error:", data);
        return;
      }

      if (Array.isArray(data)) {
        console.log("Patient tests:", data);
      }

      setTests(data);
    } catch (err) {
      console.error("Error fetching tests:", err);
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleDownload = async (testId, fileName = "result.pdf") => {
    const url = `${backendURL}/api/lab/download-result/${testId}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to download PDF");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download PDF");
    }
  };

  const handleView = async (testId) => {
    const url = `${backendURL}/api/lab/download-result/${testId}`;
    console.log("Opening PDF for testId:", testId);

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch PDF");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      setViewPdfUrl(blobUrl);
    } catch (err) {
      console.error("Error opening PDF:", err);
      toast.error("Failed to open PDF");
    }
  };

  return (
    <div className="min-h-screen p-16 bg-gradient-to-br from-indigo-100 to-blue-100 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold mb-6 text-indigo-700 tracking-wide">
        My Lab Test Requests
      </h1>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
        {loading ? (
          <p className="text-center text-gray-500 py-10 text-lg">
            Loading lab test requests...
          </p>
        ) : tests.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-lg">
            No lab test requests found
          </p>
        ) : (
          <table className="w-full text-left border-collapse rounded-xl overflow-hidden text-sm md:text-base">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3">Test</th>
                <th className="p-3">Status</th>
                <th className="p-3">Requested At</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tests.map((test) => (
                <tr
                  key={test._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">{test.testName}</td>

                  <td
                    className={`p-3 font-semibold capitalize 
                      ${test.status === "pending"
                        ? "text-yellow-600"
                        : test.status === "accepted"
                          ? "text-blue-600"
                          : test.status === "completed"
                            ? "text-green-600"
                            : "text-red-600"
                      }
                    `}
                  >
                    {test.status}
                  </td>

                  <td className="p-3">
                    {new Date(test.requestedAt).toLocaleString()}
                  </td>

                  <td className="p-3 space-x-2">
                    {test.status === "completed" && test.resultFile && (
                      <>
                        <button
                          onClick={() =>
                            handleDownload(
                              test._id,
                              `${test.testName}-result.pdf`
                            )
                          }
                          className="bg-indigo-600 text-white px-3 py-1 rounded-lg shadow hover:bg-indigo-700 transition"
                        >
                          Download
                        </button>

                        <button
                          onClick={() => handleView(test._id)}
                          className="bg-gray-600 text-white px-3 py-1 rounded-lg shadow hover:bg-gray-700 transition"
                        >
                          View
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PDF Modal */}
      {viewPdfUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
          <div className="bg-white w-11/12 md:w-3/4 h-4/5 rounded-2xl shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setViewPdfUrl(null)}
              className="absolute top-3 right-3 bg-red-500 text-white px-4 py-1 rounded-lg shadow hover:bg-red-600"
            >
              Close
            </button>

            <iframe
              src={viewPdfUrl}
              title="Test Result"
              className="w-full h-full rounded-lg"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientLabTests;

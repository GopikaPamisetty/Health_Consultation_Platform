import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const LabTestRequests = () => {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [file, setFile] = useState(null);
  const token = localStorage.getItem("token");
  const [viewPdfUrl, setViewPdfUrl] = useState(null);

  //  Loading States
  const [loadingTests, setLoadingTests] = useState(true);
  const [uploading, setUploading] = useState(false);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const fetchTests = async () => {
    try {
      setLoadingTests(true);

      const user = JSON.parse(localStorage.getItem("user"));
      console.log("Current user from localStorage:", user);

      console.log("Fetching lab tests...");
      const res = await fetch(`${backendURL}/api/lab-tests/tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to fetch test requests");
        console.error("Fetch returned an error:", data);
        setLoadingTests(false);
        return;
      }

      if (Array.isArray(data)) {
        data.forEach((t) => console.log(t.testName, t.status, t.result));
      }

      setTests(data);
      console.log("Lab tests set in state:", data);
    } catch (err) {
      console.error("Error fetching tests:", err);
      toast.error("Error: " + err.message);
    }

    setLoadingTests(false);
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      const res = await fetch(`${backendURL}/api/lab-tests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.message || "Failed to update test");
      else {
        toast.success("Status updated");
        fetchTests();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedTest) {
      console.log("No file or test selected");
      return toast.error("Select a file");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const res = await axios.post(
        `${backendURL}/api/lab/upload-result/${selectedTest._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          responseType: "json",
        }
      );

      toast.success(res.data.message || "File uploaded successfully");

      setSelectedTest(null);
      setFile(null);
      fetchTests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }

    setUploading(false);
  };

  const handleDownload = (testId, fileName = "result.pdf") => {
    const url = `${backendURL}/api/lab/download-result/${testId}`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    link.click();
  };

  const handleView = async (testId) => {
    const url = `${backendURL}/api/lab/download-result/${testId}`;
    console.log("Opening PDF for testId:", testId, "URL:", url);

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch PDF");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      setViewPdfUrl(blobUrl);
    } catch (err) {
      toast.error("Failed to open PDF");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-100 to-blue-200 flex flex-col items-center">

      <h1 className="text-3xl font-extrabold mb-6 text-indigo-700 drop-shadow-sm">
        Lab Test Requests
      </h1>

      {/*  Full-Screen Loader */}
      {loadingTests ? (
        <div className="w-full max-w-5xl bg-white shadow-xl rounded-3xl p-10 animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
        </div>
      ) : (
        <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl p-8 border border-gray-200">
          {tests.length === 0 ? (
            <p className="text-center text-gray-500 text-lg py-10">
              No test requests found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-indigo-600 text-white text-left">
                    <th className="p-3">Patient</th>
                    <th className="p-3">Test</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">appointmentDate</th>
                    <th className="p-3">completed At</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {tests.map((test) => (
                    <tr
                      key={test._id}
                      className="border-b hover:bg-indigo-50 transition"
                    >
                      <td className="p-3 font-semibold">
                        {test.patientId?.name}
                      </td>
                      <td className="p-3">{test.testName}</td>

                      <td
                        className={`p-3 font-medium capitalize ${test.status === "pending"
                          ? "text-yellow-600"
                          : test.status === "accepted"
                            ? "text-blue-600"
                            : test.status === "completed"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                      >
                        {test.status}
                      </td>

                      <td className="p-3 text-gray-600">
                        {test.appointmentDate
                          ? new Date(test.appointmentDate).toLocaleString()
                          : "Not Scheduled"}

                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(test.completedAt).toLocaleString()}
                      </td>

                      <td className="p-3 space-x-2">
                        {test.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdate(test._id, "accepted")}
                              className="bg-green-600 text-white px-3 py-1 rounded-lg shadow hover:bg-green-700 transition"
                            >
                              Accept
                            </button>

                            <button
                              onClick={() => handleUpdate(test._id, "rejected")}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600 transition"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* {test.status === "accepted" && (
                          <button
                            onClick={() => setSelectedTest(test)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-700 transition"
                          >
                            Complete & Upload
                          </button>
                        )} */}
                        {test.status === "accepted" && (
                          (() => {
                            const now = new Date();
                            const appt = new Date(test.appointmentDate);

                            const canUpload = appt && now >= appt;

                            return (
                              <button
                                onClick={canUpload ? () => setSelectedTest(test) : null}
                                disabled={!canUpload}
                                className={`px-3 py-1 rounded-lg shadow transition 
          ${canUpload
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-400 text-gray-200 cursor-not-allowed"}
        `}
                              >
                                Complete & Upload
                              </button>
                            );
                          })()
                        )}


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
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {selectedTest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 border border-gray-200 animate-fadeIn">
            <h2 className="text-xl font-bold mb-3 text-indigo-700">
              Upload Test Result
            </h2>

            <p className="text-gray-700 mb-3">{selectedTest.testName}</p>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mb-4 w-full border p-2 rounded-lg"
            />

            {/* Upload Loader */}
            {uploading ? (
              <div className="text-center py-2 animate-pulse text-blue-600 font-semibold">
                Uploading...
              </div>
            ) : (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedTest(null)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpload}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition"
                >
                  Upload
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewPdfUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-4/5 md:w-3/4 h-4/5 rounded-xl shadow-2xl relative border border-gray-200">
            <button
              onClick={() => setViewPdfUrl(null)}
              className="absolute top-3 right-3 bg-red-500 text-white px-4 py-1.5 rounded-lg shadow hover:bg-red-600 transition"
            >
              Close
            </button>

            <iframe
              src={viewPdfUrl}
              title="Test Result"
              className="w-full h-full rounded-xl"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTestRequests;

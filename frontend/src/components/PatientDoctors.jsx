import React, { useEffect, useState } from "react";
import axios from "axios";
import DoctorCard from "./DoctorCard";

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/doctors")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.doctors || res.data.data || [];
        console.log("Fetched doctors:", data);
        setDoctors(data);
      })
      .catch((err) => {
        console.error("Error fetching doctors:", err);
        setDoctors([]);
      })
      .finally(() => {
        setLoading(false); //  stop loading after success or failure
      });
  }, []);





  const specializations = Array.from(
    new Set(doctors.map((doc) => doc.specialization).filter(Boolean))
  );

  const filteredDoctors = doctors.filter((doctor) => {
    const name = doctor.name?.toLowerCase() || "";
    const spec = doctor.specialization?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || spec.includes(search);
    const matchesSpec = selectedSpec === "" || doctor.specialization === selectedSpec;

    return matchesSearch && matchesSpec;
  });


  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 px-1 py-16">
      {/* Header */}
      <h2 className="text-3xl font-semibold text-slate-700 mb-6 text-center">
        Available Doctors
      </h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8 w-full max-w-4xl">
        <input
          type="text"
          placeholder="Search by name or specialization"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <select
          value={selectedSpec}
          onChange={(e) => setSelectedSpec(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">All Specializations</option>
          {specializations.map((spec, index) => (
            <option key={index} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {/* Doctor List */}
      {/* Doctor List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4">
        {loading ? (
          <p className="text-gray-600 text-lg text-center col-span-full">
            🔍 Searching for doctors...
          </p>
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-200 flex flex-col justify-between"
            >
              <DoctorCard doctor={doc} />
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-lg text-center col-span-full">
            ❌ No doctors found matching your search criteria.
          </p>
        )}
      </div>

    </div>
  );
};

export default PatientDoctors;

import React, { useEffect, useState } from "react";
import DoctorCard from "./DoctorCard";
import axios from "axios";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios
      .get("/api/doctors")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-8 bg-[#f8f9fc] min-h-screen text-center">
      <h2 className="text-3xl font-semibold mb-10 text-gray-800">
        Our Doctors
      </h2>

      <div
        className="
          grid 
          grid-cols-[repeat(auto-fit,minmax(300px,1fr))] 
          gap-6 
          px-8 
          md:ml-0 
          lg:ml-[220px]
        "
      >
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            className="
              max-w-full 
              bg-[#e8f0fe] 
              rounded-2xl 
              shadow-md 
              p-6 
              text-center 
              transition 
              transform 
              duration-300 
              ease-in-out 
              hover:-translate-y-1 
              hover:shadow-lg
            "
          >
            <DoctorCard doctor={doctor} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;

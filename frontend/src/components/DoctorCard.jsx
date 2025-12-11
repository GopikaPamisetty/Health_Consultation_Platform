import React from "react";
import { FaUserMd, FaStethoscope } from "react-icons/fa";
import { Link } from "react-router-dom";

const DoctorCard = ({ doctor }) => {
  return (
    <div className="bg-[#d1e6e7] rounded-xl p-6 shadow-md text-center transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl h-full min-h-[370px] flex flex-col justify-between">
      {/* Image */}
      <div className="h-[100px] flex justify-center items-center mb-4">
        {doctor.imageUrl ? (
          <img
            src={doctor.imageUrl}
            alt={doctor.name}
            className="w-20 h-20 object-cover rounded-full"
          />
        ) : (
          <FaUserMd size={80} className="text-gray-600" />
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Dr. {doctor.name}
        </h3>
        <p className="flex items-center justify-center gap-1 text-gray-700 mb-1">
          <FaStethoscope className="text-gray-600" /> {doctor.specialization}
        </p>
        <p className="text-gray-700 mb-1">{doctor.title}</p>
        <p className="text-gray-800 font-medium">
          <strong>Experience:</strong> {doctor.experience} years
        </p>

        <Link
          to={`/appointment/${doctor._id}`}
          className="inline-block mt-4 px-4 py-2 bg-sky-600 text-white font-bold rounded-md hover:bg-sky-700 transition-colors duration-300"
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;

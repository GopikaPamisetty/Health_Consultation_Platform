import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaUserMd, FaCalendarCheck, FaChartPie } from "react-icons/fa";

const COLORS = ["#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#6B7280"];
const DoctorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [doctor, setDoctor] = useState(null);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const doctorId = user?._id;
        setDoctor(user);
        const token = localStorage.getItem("token");

        const response = await axios.get(
         `${backendURL}/api/analytics/doctor/${doctorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const transformed = response.data.map((item) => ({
          name: item._id,
          count: item.count,
        }));

        const total = transformed.reduce((sum, d) => sum + d.count, 0);
        setChartData(transformed);
        setTotalAppointments(total);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-5xl bg-gradient-to-r from-blue-700 to-cyan-600 text-white rounded-2xl shadow-lg p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <FaUserMd className="text-4xl opacity-90" />
          <div>
            <h1 className="text-2xl font-semibold">
              {doctor?.name || "Doctor Analytics Dashboard"}
            </h1>
            <p className="text-sm text-cyan-100">{doctor?.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-cyan-100">Total Appointments</p>
          <p className="text-3xl font-bold">{totalAppointments}</p>
        </div>
      </div>

      {/* Chart Card */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8 transition-all hover:shadow-2xl border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <FaChartPie className="text-blue-700 text-2xl" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Appointment Distribution
          </h2>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading analytics...</p>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "10px",
                  border: "1px solid #E5E7EB",
                  color: "#1F2937",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-600">
            No analytics data available.
          </p>
        )}
      </div>

      {/* Summary Cards */}
      {!loading && chartData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10 max-w-5xl w-full">
          {chartData.map((data, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center hover:shadow-lg transition-transform hover:-translate-y-1 border border-gray-100"
            >
              <FaCalendarCheck
                className="text-blue-700 text-3xl mb-3"
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold text-gray-800">{data.name}</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {data.count}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAnalytics;

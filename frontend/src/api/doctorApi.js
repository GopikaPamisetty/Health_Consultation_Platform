// src/api/doctorApi.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const fetchDoctorsBySpecialization = async (specialization) => {
  const res = await API.get(`/doctors?specialization=${specialization}`);
  return res.data;
};

export const fetchDoctorById = async (id) => {
  const res = await API.get(`/doctors/${id}`);
  return res.data;
};

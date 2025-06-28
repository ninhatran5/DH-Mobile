import axios from "axios";

// === Base ===
const BASE_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL_ADDRESS = import.meta.env.VITE_BASE_URL_ADDRESS;

// === Admin instance ===
export const axiosAdmin = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

axiosAdmin.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === User instance ===
export const axiosUser = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

axiosUser.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const axiosConfigAddress = axios.create({
  baseURL: BASE_URL_ADDRESS,
  timeout: 10000,
});

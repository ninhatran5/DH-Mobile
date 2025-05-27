import axios from "axios";

export const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
});

export const axiosConfigAddress = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_ADDRESS,
  timeout: 10000,
});

axiosConfig.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

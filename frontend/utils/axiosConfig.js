import axios from "axios";

export const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
});

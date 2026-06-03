import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
});

// Automatically attach token
axiosInstance.interceptors.request.use((config) => {

  const aToken = localStorage.getItem("aToken");
  const dToken = localStorage.getItem("dToken");

  if (aToken) {
    config.headers.Authorization = `Bearer ${aToken}`;
  }

  if (dToken) {
    config.headers.Authorization = `Bearer ${dToken}`;
  }

  return config;
});

export default axiosInstance;
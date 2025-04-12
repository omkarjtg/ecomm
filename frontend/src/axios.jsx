import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;


const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined") {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("Unauthorized or Forbidden request. Redirecting to login...");
      localStorage.removeItem("token");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default API;
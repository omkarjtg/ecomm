import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const API = axios.create({
  baseURL: BASE_URL

  // withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== "undefined") {
    config.headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("⚠️ No valid token found for this request!");
  }
  return config;

},
  (error) => {
    return Promise.reject(error);
  }
);

export default API;

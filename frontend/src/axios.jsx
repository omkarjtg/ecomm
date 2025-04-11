import axios from "axios";

const API = axios.create({
  baseURL: "https://ecomm-txs3.onrender.com"

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



import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://mern-stack-lms-project-8.onrender.com",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  console.log("🚀 INTERCEPTOR RUNNING");
  console.log("TOKEN:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;

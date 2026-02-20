// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:5000",
//   // ❌ REMOVE default Content-Type completely
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("accessToken");


//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default axiosInstance;

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
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

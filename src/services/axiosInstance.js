import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {},
  timeout: 300000,
});

// Force update token (replace with your new token)
localStorage.setItem(
  "site",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiSFIiLCJlbWFpbElkIjoiam9zZWZpbmEuYmVja2VyNzZAd2lkZS1kb29ycG9zdC5uZXQiLCJ1c2VySWQiOiI2OTQyNDU1ODhhZTA5YTQ4OTEyN2RhZmIiLCJpc1ByZW1pZXIiOnRydWUsInRlbmFudElkIjoiNjk0MjQ1NTU4YWUwOWE0ODkxMjdjNTZjIiwiaWF0IjoxNzY2NjQyODMzLCJleHAiOjE3NjY2NDM3MzMsImF1ZCI6Ii9jbXMvb2F1dGgyL3Rva2VuIiwiaXNzIjoiY21zOmFwaSJ9.g5SW3_gtVMkrpsYQE2jWGzL4LsUKXH2feeTWdIfHKXQ"
);

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("site");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    config.headers["Accept-Language"] =
      localStorage.getItem("appLanguage") || "en";
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Authentication failed - token may be expired");
      // Clear invalid token
      localStorage.removeItem("site");
      // You can redirect to login or refresh token here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

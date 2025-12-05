import axios from "axios";

// Set baseURL based on environment
const baseURL = "https://course-master-backend-chi.vercel.app/api";

// Configure axios defaults
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

// Add request interceptor to include token in Authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;

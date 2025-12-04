import axios from "axios";

// Set baseURL based on environment
const baseURL = "https://course-master-backend-chi.vercel.app/api";
// Configure axios defaults
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

export default axios;

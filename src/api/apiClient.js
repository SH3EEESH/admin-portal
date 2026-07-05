import axios from "axios";

// Backend base URL. Zach's Express API should be reachable here. Set REACT_APP_API_URL in a .env file to point at the real backend (falls back to localhost:5000/api for local development).
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if we have one) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sentinel_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever tells us the token is invalid/expired, clear it out so the app falls back to a logged-out state instead of looping on 401s.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("sentinel_token");
      localStorage.removeItem("sentinel_user");
    }
    return Promise.reject(error);
  }
);

export default apiClient;

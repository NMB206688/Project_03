// client/src/api.js
import axios from "axios";

// Base URL from .env.development (Vite)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api/v1";

// One axios instance for the whole app
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Small helpers to keep components clean
export const AuthAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (name, email, password, role = "user") =>
    api.post("/auth/register", { name, email, password, role }),
};

export const FeedbackAPI = {
  create: (payload) => api.post("/feedback", payload),
  list: (params) => api.get("/feedback", { params }),
  updateStatus: (id, status) => api.patch(`/feedback/${id}/status`, { status }),
  comments: {
    add: (id, body) => api.post(`/feedback/${id}/comments`, { body }),
    list: (id) => api.get(`/feedback/${id}/comments`),
  },
};

export default api;

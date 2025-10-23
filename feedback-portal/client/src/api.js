import axios from "axios";
import { getToken } from "./auth";

// Resolve base URL in a flexible, safe way.
const rawBase =
  import.meta.env.VITE_API_BASE ||             // your current env var
  import.meta.env.VITE_API_URL ||              // optional fallback name
  `${window.location.origin}/api`;             // same-origin default

// Normalize: remove trailing slashes so "/feedback" doesn't become "//feedback"
const API_BASE = String(rawBase).replace(/\/+$/, "");

// Create a preconfigured axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Attach bearer token if present
api.interceptors.request.use((config) => {
  const token = getToken?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Auth endpoints ---
export const AuthAPI = {
  login(email, password) {
    return api.post("/auth/login", { email, password });
  },
  register(name, email, password) {
    return api.post("/auth/register", { name, email, password });
  },
};

// --- Feedback endpoints ---
export const FeedbackAPI = {
  create({ title, body, category = "other", isAnonymous = true }) {
    return api.post("/feedback", { title, body, category, isAnonymous });
  },
  list(params = {}) {
    return api.get("/feedback", { params });
  },
  updateStatus(id, status) {
    return api.patch(`/feedback/${id}/status`, { status });
  },
  comments: {
    list(id) {
      return api.get(`/feedback/${id}/comments`);
    },
    add(id, body) {
      return api.post(`/feedback/${id}/comments`, { body });
    },
  },
};

export default api;

// client/src/lib/api.js
import axios from "axios";
import { getToken } from "./auth";

/**
 * Resolve the API base:
 * - VITE_API_BASE (preferred) should point to "/api" or full "https://.../api"
 * - VITE_API_URL is accepted as a fallback
 * - Default to same-origin "/api"
 */
const rawBase =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  `${window.location.origin}/api`;

// Normalize trailing slashes, then append "/v1" because server mounts routes at /api/v1/*
const API_BASE = String(rawBase).replace(/\/+$/, "");
const API_BASE_V1 = `${API_BASE}/v1`;

// Shared axios instance
const api = axios.create({
  baseURL: API_BASE_V1,
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

// ---- Auth endpoints (/api/v1/auth/...) ----
export const AuthAPI = {
  login(email, password) {
    return api.post("/auth/login", { email, password });
  },
  register(name, email, password) {
    return api.post("/auth/register", { name, email, password });
  },
};

// ---- Feedback endpoints (/api/v1/feedback...) ----
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

// client/src/api.js
import axios from "axios";
import { getToken } from "./auth";

// 1) Resolve base URL.
// - In prod on Vercel you'll set VITE_API_BASE to your Railway URL (e.g. https://project03-production-xxxx.up.railway.app/api/v1)
// - In local dev you can use VITE_API_BASE=http://localhost:5000/api/v1
const rawBase =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  `${window.location.origin}/api/v1`; // same-origin fallback if you proxy in dev

// normalize (no trailing slash)
const API_BASE = String(rawBase).replace(/\/+$/, "");

// 2) Axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

// 3) Attach Bearer token on every request (if present)
api.interceptors.request.use((config) => {
  const t = getToken?.();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// 4) Auth endpoints
export const AuthAPI = {
  login(email, password) {
    return api.post(`/auth/login`, { email, password });
  },
  register(name, email, password) {
    return api.post(`/auth/register`, { name, email, password });
  },
  me() {
    return api.get(`/auth/me`);
  },
};

// 5) Feedback endpoints (admin PATCH requires token)
export const FeedbackAPI = {
  create({ title, body, category = "other", isAnonymous = true }) {
    return api.post(`/feedback`, { title, body, category, isAnonymous });
  },
  list(params = {}) {
    return api.get(`/feedback`, { params });
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

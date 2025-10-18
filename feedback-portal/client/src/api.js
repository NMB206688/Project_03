import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthAPI = {
  login(email, password) { return api.post("/auth/login", { email, password }); },
  register(name, email, password) { return api.post("/auth/register", { name, email, password }); },
};

export const FeedbackAPI = {
  create({ title, body, category = "other", isAnonymous = true }) {
    return api.post("/feedback", { title, body, category, isAnonymous });
  },
  list(params = {}) { return api.get("/feedback", { params }); },
  updateStatus(id, status) { return api.patch(`/feedback/${id}/status`, { status }); },
  comments: {
    list(id) { return api.get(`/feedback/${id}/comments`); },
    add(id, body) { return api.post(`/feedback/${id}/comments`, { body }); },
  },
};

export default api;

export function getToken() {
  return sessionStorage.getItem("token") || localStorage.getItem("token") || null;
}
export function getUser() {
  const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || null;
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function isAuthed() { return !!getToken(); }

export function setAuth({ token, user, remember = false }) {
  clearAuth();
  const store = remember ? localStorage : sessionStorage;
  store.setItem("token", token);
  store.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  try {
    sessionStorage.removeItem("token"); sessionStorage.removeItem("user");
    localStorage.removeItem("token"); localStorage.removeItem("user");
  } catch {}
}

export function logout(){ clearAuth(); }

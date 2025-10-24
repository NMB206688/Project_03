// client/src/auth.js

const TOKEN_KEY = "fp_token";
const USER_KEY = "fp_user";

/** Safe window guard (prevents errors in odd environments) */
function hasWindow() {
  return typeof window !== "undefined" && window.localStorage && window.sessionStorage;
}

/** Pick the right storage based on remember flag */
function pickStore(remember) {
  if (!hasWindow()) return null;
  return remember ? window.localStorage : window.sessionStorage;
}

/** Save token. If remember=false, keep it in sessionStorage only */
export function setToken(token, remember = false) {
  const store = pickStore(remember);
  if (!store) return;

  if (token) {
    store.setItem(TOKEN_KEY, token);
  } else {
    store.removeItem(TOKEN_KEY);
  }

  // remove stale copy from the other store
  const other = remember ? window.sessionStorage : window.localStorage;
  other.removeItem(TOKEN_KEY);
}

/** Read token from either place (session first, then local) */
export function getToken() {
  if (!hasWindow()) return null;
  return (
    window.sessionStorage.getItem(TOKEN_KEY) ||
    window.localStorage.getItem(TOKEN_KEY) ||
    null
  );
}

/** Save user object (mirrors setToken behavior) */
export function setUser(user, remember = false) {
  const store = pickStore(remember);
  if (!store) return;

  if (user) {
    store.setItem(USER_KEY, JSON.stringify(user));
  } else {
    store.removeItem(USER_KEY);
  }

  const other = remember ? window.sessionStorage : window.localStorage;
  other.removeItem(USER_KEY);
}

/** Read user object from either place */
export function getUser() {
  if (!hasWindow()) return null;
  try {
    const raw =
      window.sessionStorage.getItem(USER_KEY) ||
      window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** True if we have a token */
export function isAuthed() {
  return !!getToken();
}

/** Clear everything (token + user) from both stores */
export function clearAuth() {
  if (!hasWindow()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}

/** Optional alias so you can `import { logout } from "./auth"` */
export const logout = clearAuth;

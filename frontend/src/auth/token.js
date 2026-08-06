const TOKEN_KEY = "shophub_token";
const USER_KEY  = "shophub_user";

// ── Token ──────────────────────────────────────
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ── User info ──────────────────────────────────
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('shophub-auth-changed'));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

// ── Logout (xóa hết) ───────────────────────────
export function logout() {
  clearToken();
  clearUser();
  window.dispatchEvent(new Event('shophub-auth-changed'));
}
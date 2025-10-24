// client/src/pages/Login.jsx
import { useState } from "react";
import { AuthAPI } from "../api";
import { setToken, setUser } from "../auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onLogin(e) {
    e.preventDefault();
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      const { data } = await AuthAPI.login(email.trim(), password);
      setToken(data.token, remember);
      setUser(data.user, remember);
      window.location.href = "/admin";
    } catch (ex) {
      const msg = ex?.response?.data?.error || "Login failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-wrap page-compact">
      <div className="container-center">
        <div className="card card-narrow">
          <h1 className="h1" style={{ textAlign: "center" }}>Login</h1>

          <form onSubmit={onLogin} className="form-two-col">
            {/* Email */}
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            {/* Password */}
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {/* Remember me */}
            <label className="full row" style={{ alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me on this device</span>
            </label>

            {/* Submit */}
            <button className="btn full" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>

            {/* Error */}
            {err && (
              <div className="alert full" style={{ textAlign: "center" }}>
                {err}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api";
import { setAuth } from "../auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const { data } = await AuthAPI.login(email.trim(), password);
      setAuth({ token: data.token, user: data.user, remember });
      setMsg({ type: "ok", text: `Welcome, ${data.user.name}!` });
      setTimeout(() => nav(data.user.role === "admin" ? "/admin" : "/"), 500);
    } catch (err) {
      const text = err?.response?.data?.error || "Login failed";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-center">
      <div className="stack" style={{ width: "100%", maxWidth: 520 }}>
        <div className="card" style={{ width: "100%" }}>
          <h1 className="h1" style={{ textAlign: "center" }}>Login</h1>
          <p className="p" style={{ textAlign: "center" }}>
            Admins can access the dashboard after sign-in.
          </p>

          <form className="row" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <label>
              <div style={{ marginBottom: 6, color: "var(--muted)" }}>Email</div>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              <div style={{ marginBottom: 6, color: "var(--muted)" }}>Password</div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 0,
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="p" style={{ margin: 0 }}>
                Remember me on this device
              </span>
            </label>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 2 }}>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEmail("");
                  setPassword("");
                  setMsg(null);
                  setRemember(false);
                }}
              >
                Clear
              </button>
            </div>

            {msg && (
              <div className={`alert ${msg.type === "ok" ? "success" : ""}`} style={{ textAlign: "center" }}>
                {msg.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

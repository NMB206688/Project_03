import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api";

// A colorful, interactive login card.
export default function Login(){
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'error'|'ok', text: string }

  async function handleSubmit(e){
    e.preventDefault();            // prevent page reload
    setMsg(null);
    setLoading(true);
    try{
      // call API
      const { data } = await AuthAPI.login(email, password);
      // persist token for subsequent requests (api interceptor will read it)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMsg({ type: "ok", text: `Welcome, ${data.user.name}!` });
      // small delay to show success then navigate
      setTimeout(()=> nav("/admin"), 600);
    }catch(err){
      const text = err?.response?.data?.error || "Login failed";
      setMsg({ type: "error", text });
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="nav">
        <a href="/">Submit</a>
        <a href="/admin">Admin</a>
        <span className="brand-badge">Feedback Portal</span>
      </div>

      {/* NEW: center the card so there's no empty right side */}
      <div className="centered">
        <div className="card" style={{ maxWidth: 520, width: "100%" }}>
          <h1 className="h1">Welcome back</h1>
          <p className="p">Sign in to manage feedback. Use the seeded admin from earlier.</p>

          <form className="row" onSubmit={handleSubmit}>
            <label>
              <div style={{ marginBottom: 6, color: "var(--muted)" }}>Email</div>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="you@school.edu"
                required
              />
            </label>

            <label>
              <div style={{ marginBottom: 6, color: "var(--muted)" }}>Password</div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <div style={{ display:"flex", gap:12 }}>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={()=>{ setEmail(""); setPassword(""); setMsg(null); }}
              >
                Clear
              </button>
            </div>

            {msg && (
              <div className={`alert ${msg.type === "ok" ? "success" : ""}`}>
                {msg.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

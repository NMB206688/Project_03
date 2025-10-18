import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api";

export default function Signup(){
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e){
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try{
      await AuthAPI.register(name.trim(), email.trim(), password);
      setMsg({ type: "ok", text: "Account created. Please log in." });
      setTimeout(()=> nav("/login"), 700);
    }catch(err){
      const text = err?.response?.data?.error || "Signup failed";
      setMsg({ type: "error", text });
    }finally{ setLoading(false); }
  }

  return (
    <div className="center-page">
      <div className="card" style={{ maxWidth: 520, width: "100%" }}>
        <h1 className="h1" style={{textAlign:"center"}}>Create account</h1>
        <p className="p" style={{textAlign:"center"}}>For regular users. Admin access is restricted.</p>

        <form className="row" onSubmit={handleSubmit}>
          <label>
            <div style={{ marginBottom: 6, color: "var(--muted)" }}>Name</div>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required />
          </label>
          <label>
            <div style={{ marginBottom: 6, color: "var(--muted)" }}>Email</div>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>
          <label>
            <div style={{ marginBottom: 6, color: "var(--muted)" }}>Password</div>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          </label>

          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? "Creating..." : "Sign up"}</button>
            <button type="button" className="btn btn-secondary" onClick={()=>{ setName(""); setEmail(""); setPassword(""); setMsg(null); }}>Clear</button>
          </div>

          {msg && <div className={`alert ${msg.type === "ok" ? "success" : ""}`}>{msg.text}</div>}
        </form>
      </div>
    </div>
  );
}

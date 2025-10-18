import { useEffect, useState } from "react";
import { FeedbackAPI } from "../api";
import { isAuthed } from "../auth";

export default function Submit() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("other");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [errors, setErrors] = useState({});
  const [mine, setMine] = useState([]);
  const authed = isAuthed();

  function validate() {
    const e = {};
    if (!title.trim()) e.title = "Please enter a short title.";
    if (!body.trim()) e.body = "Please describe your suggestion or issue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setMsg(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await FeedbackAPI.create({ title: title.trim(), body: body.trim(), category, isAnonymous });
      setMsg({ type: "ok", text: "Thanks! Your feedback was submitted." });
      setTitle(""); setBody("");
      if (authed) loadMine();
    } catch (err) {
      const text = err?.response?.data?.error || "Could not submit feedback";
      setMsg({ type: "error", text });
    } finally { setLoading(false); }
  }

  async function loadMine() {
    try {
      const { data } = await FeedbackAPI.list({ sort: "-createdAt", limit: 5 });
      setMine(data.results || []);
    } catch { /* ignore */ }
  }

  useEffect(() => { if (authed) loadMine(); }, [authed]);

  return (
    <div className="center-page">
      <div className="stack">
        <div className="card card-full">
          <h1 className="h1" style={{ textAlign: "center" }}>Share your feedback</h1>
          <p className="p" style={{ textAlign: "center" }}>
            Suggestions, bugs, or improvement ideas—everything helps. You can submit anonymously.
          </p>

          <form className="row" onSubmit={handleSubmit}>
            <label>
              <div style={{ marginBottom: 6, color: "var(--muted)" }}>Title</div>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary" maxLength={200}/>
              {errors.title && <div className="alert" style={{ marginTop: 8 }}>{errors.title}</div>}
            </label>

            <label>
              <div style={{ marginBottom: 6, color: "var(--muted)" }}>Category</div>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="ux">UX</option>
                <option value="process">Process</option>
                <option value="other">Other</option>
              </select>
              <div className="help">This helps admins triage faster.</div>
            </label>

            <label>
              <div style={{ marginBottom: 6, color: "var(--muted)" }}>Details</div>
              <textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)}
                placeholder="Describe what happened or what you'd like to see..." maxLength={5000}/>
              {errors.body && <div className="alert" style={{ marginTop: 8 }}>{errors.body}</div>}
            </label>

            <div className="switch" aria-label="Submit anonymously" style={{ justifyContent: "center" }}>
              <label style={{ color: "var(--muted)" }}>Submit anonymously</label>
              <label>
                <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                <span className="track"><span className="thumb" /></span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 6, justifyContent: "center" }}>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Submitting…" : "Submit feedback"}
              </button>
              <button type="button" className="btn btn-secondary"
                onClick={() => { setTitle(""); setBody(""); setErrors({}); setMsg(null); }}>
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

        {authed && (
          <div className="card card-full">
            <h2 className="h1" style={{ fontSize: 22, textAlign: "center" }}>My latest submissions</h2>
            {mine.length === 0 ? (
              <p className="p" style={{ textAlign: 'center' }}>No submissions yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display:'grid', gap:10 }}>
                {mine.map(m => (
                  <li key={m.id} className="card" style={{ padding: 12 }}>
                    <div style={{ fontWeight: 700 }}>{m.title}</div>
                    <div className="p" style={{ marginTop: 4 }}>{m.body}</div>
                    <div style={{ display:'flex', gap:8, marginTop:6, alignItems:'center', flexWrap:'wrap' }}>
                      <span className="chip">{m.category}</span>
                      <span className={`chip ${m.status}`}>{m.status.replace('_',' ')}</span>
                      <span className="badge">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

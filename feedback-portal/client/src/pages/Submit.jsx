import { useState } from "react";
import { FeedbackAPI } from "../api";

// Pretty form to submit feedback (anonymous allowed).
export default function Submit() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("other"); // enums: bug|feature|ux|process|other
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // {type:'ok'|'error', text:string}
  const [errors, setErrors] = useState({});

  // small client-side validation (keeps API calls clean)
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
      // This endpoint allows anonymous submissions.
      const { data } = await FeedbackAPI.create({
        title: title.trim(),
        body: body.trim(),
        category,
        isAnonymous,
      });
      // show success and reset form (keep category/toggle)
      setMsg({ type: "ok", text: "Thanks! Your feedback was submitted." });
      setTitle("");
      setBody("");
    } catch (err) {
      const text = err?.response?.data?.error || "Could not submit feedback";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="nav">
        <a href="/">Submit</a>
        <a href="/admin">Admin</a>
        <a href="/login" style={{ marginLeft: "auto" }}>Login</a>
        <span className="brand-badge">Feedback Portal</span>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        <h1 className="h1">Share your feedback</h1>
        <p className="p">
          Suggestions, bugs, or improvement ideas—everything helps. You can submit anonymously.
        </p>

        <form className="row" onSubmit={handleSubmit}>
          {/* Title */}
          <label>
            <div style={{ marginBottom: 6, color: "var(--muted)" }}>Title</div>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
              maxLength={200}
            />
            {errors.title && <div className="alert" style={{ marginTop: 8 }}>{errors.title}</div>}
          </label>

          {/* Category */}
          <label>
            <div style={{ marginBottom: 6, color: "var(--muted)" }}>Category</div>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="ux">UX</option>
              <option value="process">Process</option>
              <option value="other">Other</option>
            </select>
            <div className="help">This helps admins triage faster.</div>
          </label>

          {/* Body */}
          <label>
            <div style={{ marginBottom: 6, color: "var(--muted)" }}>Details</div>
            <textarea
              className="textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe what happened or what you'd like to see..."
              maxLength={5000}
            />
            {errors.body && <div className="alert" style={{ marginTop: 8 }}>{errors.body}</div>}
            <div className="help">Add steps, expected behavior, or screenshots (if any).</div>
          </label>

          {/* Anonymous toggle */}
          <div className="switch" aria-label="Submit anonymously">
            <label style={{ color: "var(--muted)" }}>Submit anonymously</label>
            <label>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span className="track"><span className="thumb" /></span>
            </label>
          </div>
          <div className="help">
            When enabled, your name won’t be shown to admins in the list. (It’s still safe to share.)
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Submitting…" : "Submit feedback"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setTitle(""); setBody(""); setErrors({}); setMsg(null); }}
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
  );
}

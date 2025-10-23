import { useEffect, useMemo, useState } from "react";
import { FeedbackAPI } from "../api";

const STATUS = ["open", "in_review", "resolved"];
const CATEGORY = ["all", "bug", "feature", "ux", "process", "other"];

export default function Admin() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("open");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  const [sel, setSel] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [actionMsg, setActionMsg] = useState(null);

  const user = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user") || "null"
  );
  const isAdmin = !!(user && user.role === "admin");

  async function load() {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sort: "-createdAt",
        ...(status ? { status } : {}),
        ...(category !== "all" ? { category } : {}),
        ...(q ? { q } : {}),
      };
      const { data } = await FeedbackAPI.list(params);
      setItems(data.results);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page, limit, status, category]);

  useEffect(() => {
    const t = setTimeout(() => {
      page !== 1 ? setPage(1) : load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q]);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  async function changeStatus(id, newStatus) {
    try {
      const { data } = await FeedbackAPI.updateStatus(id, newStatus);
      setActionMsg({ type: "ok", text: `Status → ${data.feedback.status}` });
      setItems((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: data.feedback.status } : r))
      );
      if (sel?.id === id) setSel({ ...sel, status: data.feedback.status });
    } catch (e) {
      setActionMsg({
        type: "error",
        text: e?.response?.data?.error || "Failed to update",
      });
    } finally {
      setTimeout(() => setActionMsg(null), 1200);
    }
  }

  async function loadComments(id) {
    const { data } = await FeedbackAPI.comments.list(id);
    setComments(data.results);
  }

  async function addComment() {
    if (!newComment.trim() || !sel) return;
    try {
      await FeedbackAPI.comments.add(sel.id, newComment.trim());
      setNewComment("");
      await loadComments(sel.id);
    } catch {
      setActionMsg({ type: "error", text: "Need admin login to add comments." });
      setTimeout(() => setActionMsg(null), 1200);
    }
  }

  return (
    <main className="page-wrap">
      <div className="container-center">
        <div className="card card-full">
          <h1 className="h1" style={{ textAlign: "center" }}>Admin Dashboard</h1>

          {/* one-line responsive toolbar */}
          <div className="toolbar toolbar-row">
            <span className="badge">Total: {total}</span>

            <select
              className="input"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>

            <select
              className="input"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              {CATEGORY.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* grows to fill remaining space */}
            <input
              className="input grow"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="input"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {[5, 8, 10, 20].map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="p" style={{ textAlign: "center" }}>Loading…</div>
          ) : (
            <table className="table">
              <thead>
                <tr className="tr">
                  <th className="th">Title</th>
                  <th className="th">Category</th>
                  <th className="th">Status</th>
                  <th className="th">Created</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="tr">
                    <td className="td">
                      <div style={{ fontWeight: 700 }}>{row.title}</div>
                      <div
                        className="p"
                        style={{
                          margin: 0,
                          fontSize: 12,
                          maxWidth: 520,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.body}
                      </div>
                    </td>
                    <td className="td"><span className="badge">{row.category}</span></td>
                    <td className="td"><span className={`chip ${row.status}`}>{row.status.replace("_", " ")}</span></td>
                    <td className="td">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="td" style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                        {isAdmin &&
                          STATUS.map((s) => (
                            <button
                              key={s}
                              className="btn btn-secondary"
                              style={{ padding: "8px 10px" }}
                              onClick={() => changeStatus(row.id, s)}
                            >
                              {s.replace("_", " ")}
                            </button>
                          ))}
                        <button
                          className="btn"
                          style={{ padding: "8px 10px" }}
                          onClick={() => {
                            setSel(row);
                            loadComments(row.id);
                          }}
                        >
                          View thread
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr className="tr">
                    <td className="td" colSpan={5}>No feedback found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center", justifyContent: "center" }}>
            <button className="btn btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Prev
            </button>
            <span className="badge">Page {page} / {pages}</span>
            <button className="btn btn-secondary" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>
              Next
            </button>
          </div>

          {actionMsg && (
            <div className={`alert ${actionMsg.type === "ok" ? "success" : ""}`} style={{ marginTop: 10, textAlign: "center" }}>
              {actionMsg.text}
            </div>
          )}
        </div>

        <div className="card card-full">
          <h3 className="h1" style={{ fontSize: 22, textAlign: "center" }}>Thread</h3>
          {!sel ? (
            <p className="p" style={{ textAlign: "center" }}>
              Select a feedback row and click <b>View thread</b>.
            </p>
          ) : (
            <>
              <div className="p" style={{ marginBottom: 10, textAlign: "center" }}>
                <b>{sel.title}</b><br />
                <span className={`chip ${sel.status}`}>{sel.status.replace("_", " ")}</span>
              </div>

              {isAdmin && (
                <div className="row" style={{ marginBottom: 10 }}>
                  <textarea
                    className="textarea"
                    placeholder="Add internal note… (admin only)"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button className="btn" onClick={addComment}>Add comment</button>
                  </div>
                </div>
              )}

              <div className="row" style={{ gap: 10 }}>
                {comments.length === 0 ? (
                  <p className="p" style={{ textAlign: "center" }}>No comments yet.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="card" style={{ padding: 12 }}>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {new Date(c.createdAt).toLocaleString()}
                      </div>
                      <div style={{ marginTop: 6 }}>{c.body}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

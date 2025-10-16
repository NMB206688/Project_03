// client/src/App.jsx
import { Link, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Submit from "./pages/Submit.jsx";
import Admin from "./pages/Admin.jsx";

// Simple top nav for demo navigation.
// Why inline styles? Keep this step tiny; we'll style later.
export default function App() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link to="/">Submit</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/login" style={{ marginLeft: "auto" }}>
          Login
        </Link>
      </header>

      <Routes>
        <Route path="/" element={<Submit />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

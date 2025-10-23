import "./App.scss";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Submit from "./pages/Submit.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Admin from "./pages/Admin.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import { getUser, isAuthed, logout } from "./auth";

function NavBar() {
  const nav = useNavigate();
  const authed = isAuthed();
  const user = getUser();

  function doLogout() {
    logout();
    nav("/login");
  }

  return (
    <div className="nav">
      <div style={{display:"flex", gap:12, alignItems:"center"}}>
        <Link to="/">Submit</Link>
        {authed && user?.role === "admin" && <Link to="/admin">Admin</Link>}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
        {!authed ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        ) : (
          <>
            <span className="badge">Hi, {user?.name}{user?.role === "admin" ? " (admin)" : ""}</span>
            <button className="btn btn-secondary" onClick={doLogout}>Logout</button>
          </>
        )}
        <span className="brand-badge">Feedback Portal</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <Routes>
        <Route path="/" element={<Submit />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

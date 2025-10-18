import { Navigate, Outlet } from "react-router-dom";
import { isAuthed, getUser } from "../auth";

export default function AdminRoute() {
  const authed = isAuthed();
  const user = getUser();
  if (!authed) return <Navigate to="/login" replace />;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

// client/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { isAuthed } from "../auth";

// Blocks access if no token; renders nested routes if authed
export default function ProtectedRoute() {
  return isAuthed() ? <Outlet /> : <Navigate to="/login" replace />;
}

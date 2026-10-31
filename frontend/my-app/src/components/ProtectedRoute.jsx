// A gate for pages that need a login.
// IMPORTANT: this is only for a good user experience (it hides pages).
// The REAL security is the protect() middleware in the backend.
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Wait until we know if the saved token is valid. Without this, a refresh
  // would flash the login page for a moment even for a logged-in user.
  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

  // Not logged in -> go to /login. "replace" removes this page from history,
  // so the Back button does not bring the user back here.
  if (!user) return <Navigate to="/login" replace />;

  // Logged in -> show the child routes (Layout and the pages inside it)
  return <Outlet />;
}

export default ProtectedRoute;

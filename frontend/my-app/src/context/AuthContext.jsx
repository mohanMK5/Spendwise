// CONTEXT = a box of data that ANY component can read, without passing props
// through every level. We keep "who is logged in" here, because Layout,
// ProtectedRoute, Login, Register all need it.
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext();

// The Provider wraps the whole app (see index.js). Everything inside can
// read the values we pass in value={{ ... }} at the bottom.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = not logged in
  const [loading, setLoading] = useState(true); // true while we check the token

  // Runs ONCE when the app opens or the page is refreshed.
  // React state is lost on refresh, but the token is still in localStorage,
  // so we ask the backend "who owns this token?" (GET /auth/me).
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false); // nothing to check, we are logged out
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token")) // token is bad or expired
      .finally(() => setLoading(false));
  }, []); // [] = run only once

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token); // remember the login
    setUser(res.data.user);
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A custom hook, so other files write useAuth() instead of useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext);
}

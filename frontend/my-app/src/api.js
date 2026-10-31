// One axios "instance" that every page uses to talk to the backend.
// WHY: we set the backend address and the token logic in ONE place,
// so no page needs to repeat them.
import axios from "axios";

const api = axios.create({
  // CRA only exposes env variables that start with REACT_APP_
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// INTERCEPTOR = code that runs on EVERY request before it leaves the browser.
// Here it adds the login token to the Authorization header.
// The backend's protect() middleware reads exactly this header.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

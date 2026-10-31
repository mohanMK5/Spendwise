import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/helpers";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // the login() function from AuthContext

  // STATE = data that, when it changes, makes React draw the screen again
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // One handler for both inputs. It uses the input's "name" attribute.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    setError("");

    try {
      setLoading(true);
      await login(form.email, form.password); // calls the backend
      navigate("/"); // success -> go to the dashboard
    } catch (err) {
      setError(getErrorMessage(err)); // e.g. "Invalid email or password"
    } finally {
      setLoading(false); // runs on success AND on failure
    }
  };

  return (
    <div className="LoginContainer">
      <div className="LoginInner">
        <h1 className="LoginTitle">SpendWise</h1>
        <h2>Login</h2>

        {error && <p className="LoginError">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p> No account? <Link to="/register"> Register</Link> </p>
      </div>
    </div>
  );
}

export default Login;

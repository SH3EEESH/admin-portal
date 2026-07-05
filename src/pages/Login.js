import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, authError, isSubmitting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const redirectTarget = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin/audit-logs", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    } catch {
      // authError from context already renders below
    }
  };

  return (
    <div className="auth-page">
      <div className="terminal-card">
        <p className="terminal-heading">
          <span className="nav-prompt">&gt;</span> authenticate
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {authError && <p className="form-error">{authError}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "verifying..." : "log in"}
          </button>
        </form>

        <p className="auth-switch">
          new here? <Link to="/signup">create an account</Link>
        </p>
      </div>
    </div>
  );
}

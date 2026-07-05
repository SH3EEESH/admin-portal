import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, authError, isSubmitting } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (password !== confirmPassword) {
      setLocalError("Passwords don't match.");
      return;
    }

    try {
      await signup(email, password);
      navigate("/profile", { replace: true });
    } catch {
      // authError from context already renders below
    }
  };

  return (
    <div className="auth-page">
      <div className="terminal-card">
        <p className="terminal-heading">
          <span className="nav-prompt">&gt;</span> register
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
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label htmlFor="confirmPassword">confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          {(localError || authError) && (
            <p className="form-error">{localError || authError}</p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "creating account..." : "create account"}
          </button>
        </form>

        <p className="auth-switch">
          already registered? <Link to="/login">log in</Link>
        </p>
      </div>
    </div>
  );
}

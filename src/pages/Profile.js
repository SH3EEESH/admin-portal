import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="terminal-card">
        <p className="terminal-heading">
          <span className="nav-prompt">&gt;</span> secure_profile
        </p>

        <dl className="profile-details">
          <dt>email</dt>
          <dd>{user.email}</dd>

          <dt>role</dt>
          <dd>{user.role}</dd>

          <dt>user id</dt>
          <dd>{user.id}</dd>

          <dt>session</dt>
          <dd className="status-pill status-clear">verified</dd>
        </dl>

        <p className="page-note">
          This page is only reachable with a valid session token. Any attempt
          to reach it, or an admin-only page, without one is redirected and
          recorded in the audit log.
        </p>
      </div>
    </div>
  );
}

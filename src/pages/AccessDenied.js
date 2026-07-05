import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div className="page">
      <div className="terminal-card status-flagged-border">
        <p className="terminal-heading status-flagged-text">
          <span className="nav-prompt">&gt;</span> access_denied
        </p>
        <p className="page-note">
          That route is outside your role's permissions. This attempt has
          been written to the audit log.
        </p>
        <Link className="link-button" to="/">
          return home
        </Link>
      </div>
    </div>
  );
}

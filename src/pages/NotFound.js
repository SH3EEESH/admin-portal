import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page">
      <div className="terminal-card">
        <p className="terminal-heading">
          <span className="nav-prompt">&gt;</span> 404_not_found
        </p>
        <p className="page-note">No route matches that path.</p>
        <Link className="link-button" to="/">
          return home
        </Link>
      </div>
    </div>
  );
}

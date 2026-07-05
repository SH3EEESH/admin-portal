import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="nav-bar">
      <Link to="/" className="nav-brand">
        <span className="nav-prompt">&gt;</span> Sentinel_Authentication
      </Link>

      <nav className="nav-links">
        {isAuthenticated && !isAdmin && (
          <Link to="/profile">profile</Link>
        )}
        {isAuthenticated && isAdmin && (
          <Link to="/admin/audit-logs">audit-logs</Link>
        )}
        {isAuthenticated ? (
          <>
            <span className="nav-user">{user.email}</span>
            <button className="nav-logout" onClick={handleLogout}>
              log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">login</Link>
            <Link to="/signup">sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}

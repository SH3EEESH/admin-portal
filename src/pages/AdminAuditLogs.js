import { useEffect, useMemo, useState, useCallback } from "react";
import { getAuditLogs } from "../api/auditApi";

const FILTERS = [
  { key: "all", label: "all" },
  { key: "flagged", label: "flagged", dot: "status-flagged" },
  { key: "marked", label: "marked", dot: "status-marked" },
  { key: "clear", label: "clear", dot: "status-clear" },
];

// Placeholder rows so the dashboard is reviewable before the Express audit-logs endpoint exists. Swap this out once Zach's route is live.
const MOCK_LOGS = [
  {
    id: 1,
    userEmail: "j.rivera@example.com",
    action: "LOGIN_SUCCESS",
    ipAddress: "10.0.4.12",
    status: "clear",
    createdAt: "2026-07-04T13:02:00Z",
  },
  {
    id: 2,
    userEmail: "unknown",
    action: "ADMIN_ROUTE_BLOCKED",
    ipAddress: "203.0.113.44",
    status: "flagged",
    createdAt: "2026-07-04T13:05:21Z",
  },
  {
    id: 3,
    userEmail: "d.chen@example.com",
    action: "LOGIN_FAILED_RETRY",
    ipAddress: "198.51.100.7",
    status: "marked",
    createdAt: "2026-07-04T13:08:47Z",
  },
];

export default function AdminAuditLogs() {
  const [status, setStatus] = useState("all");
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async (currentStatus) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getAuditLogs(currentStatus);
      setLogs(data);
    } catch (err) {
      // Backend route isn't live yet in local dev - fall back to mock data so the dashboard UI is still reviewable.
      setError(
        "Could not reach /audit-logs. Showing sample data until the backend is connected."
      );
      setLogs(MOCK_LOGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(status);
  }, [status, fetchLogs]);

  const visibleLogs = useMemo(() => {
    if (status === "all") return logs;
    return logs.filter((log) => log.status === status);
  }, [logs, status]);

  return (
    <div className="page">
      <div className="terminal-card wide">
        <p className="terminal-heading">
          <span className="nav-prompt">&gt;</span> audit_logs
        </p>

        <div className="filter-row">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-chip ${status === f.key ? "filter-chip-active" : ""}`}
              onClick={() => setStatus(f.key)}
            >
              {f.dot && <span className={`status-dot ${f.dot}`} />}
              {f.label}
            </button>
          ))}
          <button className="filter-refresh" onClick={() => fetchLogs(status)}>
            refresh
          </button>
        </div>

        {error && <p className="form-note">{error}</p>}

        {isLoading ? (
          <p className="page-note">loading logs...</p>
        ) : (
          <table className="log-table">
            <thead>
              <tr>
                <th>status</th>
                <th>user</th>
                <th>action</th>
                <th>ip address</th>
                <th>time</th>
              </tr>
            </thead>
            <tbody>
              {visibleLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="page-note">
                    No logs match this filter.
                  </td>
                </tr>
              )}
              {visibleLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className={`status-pill status-${log.status}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{log.userEmail}</td>
                  <td>{log.action}</td>
                  <td>{log.ipAddress}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

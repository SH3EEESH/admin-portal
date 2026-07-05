import apiClient from "./apiClient";

/**
 * Expected backend contract:
 *
 * GET /audit-logs?status=flagged|marked|clear -> [
 *   { id, userId, userEmail, action, ipAddress, status, createdAt }
 * ]
 *
 * `status` drives the color coding from the proposal:
 *   flagged -> red (malicious / blocked attempt)
 *   marked -> yellow (suspicious, needs review)
 *   clear -> green (standard, successful, non-malicious)
 */

export async function getAuditLogs(status) {
  const params = status && status !== "all" ? { status } : undefined;
  const { data } = await apiClient.get("/audit-logs", { params });
  return data;
}

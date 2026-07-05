import apiClient from "./apiClient";

/**
 * Expected backend contract (coordinate with Zachary's Express routes):
 *
 * POST /auth/login   { email, password } -> { token, user: { id, email, role } }
 * POST /auth/signup  { email, password } -> { token, user: { id, email, role } }
 *
 * `role` is expected to be "user" or "admin" (matches the Roles table).
 */

export async function loginRequest(email, password) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
}

export async function signupRequest(email, password) {
  const { data } = await apiClient.post("/auth/signup", { email, password });
  return data;
}

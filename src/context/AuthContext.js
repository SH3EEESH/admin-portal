import { createContext, useContext, useState, useCallback } from "react";
import { loginRequest, signupRequest } from "../api/authApi";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("sentinel_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("sentinel_token"));
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const persistSession = (nextToken, nextUser) => {
    localStorage.setItem("sentinel_token", nextToken);
    localStorage.setItem("sentinel_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = useCallback(async (email, password) => {
    setAuthError("");
    setIsSubmitting(true);
    try {
      const data = await loginRequest(email, password);
      persistSession(data.token, data.user);
      return data.user;
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setAuthError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signup = useCallback(async (email, password) => {
    setAuthError("");
    setIsSubmitting(true);
    try {
      const data = await signupRequest(email, password);
      persistSession(data.token, data.user);
      return data.user;
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not create that account.";
      setAuthError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sentinel_token");
    localStorage.removeItem("sentinel_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === "admin",
    authError,
    isSubmitting,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}

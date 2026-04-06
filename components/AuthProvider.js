"use client";

import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "../lib/public-config";

const AuthContext = createContext({
  session: null,
  user: null,
  isLoading: true,
  error: "",
  login: async () => ({ ok: false, error: "Unavailable" }),
  signup: async () => ({ ok: false, error: "Unavailable" }),
  logout: async () => ({ ok: false, error: "Unavailable" }),
  refreshSession: async () => ({ ok: false, error: "Unavailable" }),
});

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const [authState, setAuthState] = useState({
    session: null,
    user: null,
    isLoading: true,
    error: "",
  });

  async function refreshSession({ silent = false } = {}) {
    if (!silent) {
      setAuthState((currentValue) => ({
        ...currentValue,
        isLoading: true,
      }));
    }

    try {
      const response = await fetch(getApiUrl("/api/auth/session"), {
        method: "GET",
        cache: "no-store",
      });
      const data = await parseJsonResponse(response);

      setAuthState({
        session: data.authenticated ? { user: data.user } : null,
        user: data.user || null,
        isLoading: false,
        error: response.ok ? "" : data.error || "Unable to read the current session.",
      });

      return { ok: response.ok, data, error: data.error || "" };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to read the current session.";

      setAuthState({
        session: null,
        user: null,
        isLoading: false,
        error: message,
      });

      return { ok: false, data: null, error: message };
    }
  }

  useEffect(() => {
    let isActive = true;

    refreshSession({ silent: false }).then((result) => {
      if (!isActive) {
        return;
      }

      if (!result.ok && result.error) {
        setAuthState((currentValue) => ({
          ...currentValue,
          error: result.error,
          isLoading: false,
        }));
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function sendAuthRequest(path, payload) {
    try {
      const response = await fetch(getApiUrl(path), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload || {}),
      });
      const data = await parseJsonResponse(response);

      if (!response.ok) {
        return { ok: false, data, error: data.error || "Authentication failed." };
      }

      await refreshSession({ silent: true });
      startTransition(() => {
        router.refresh();
      });

      return { ok: true, data, error: "" };
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: error instanceof Error ? error.message : "Authentication failed.",
      };
    }
  }

  async function login(payload) {
    return sendAuthRequest("/api/auth/login", payload);
  }

  async function signup(payload) {
    return sendAuthRequest("/api/auth/signup", payload);
  }

  async function logout() {
    return sendAuthRequest("/api/auth/logout", {});
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

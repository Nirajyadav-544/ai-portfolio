
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  api,
  refreshSession,
  setAccessToken,
  setSessionExpiredHandler,
} from "../services/api";

import type { AuthUser } from "../types";

interface AuthCtx {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  // Clear the user when the API reports an expired session.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setAccessToken(null);
      setUser(null);
    });

    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  // Restore a session only on admin routes.
  useEffect(() => {
    if (!window.location.pathname.startsWith("/admin")) {
      setReady(true);
      return;
    }

    let cancelled = false;

    async function restoreSession() {
      try {
        const session = await refreshSession();

        if (!cancelled) {
          setAccessToken(session?.accessToken ?? null);
          setUser(session?.user ?? null);
        }
      } catch {
        // A missing or expired refresh cookie means the user
        // is not authenticated. Keep the login page accessible.
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);

    setAccessToken(response.accessToken);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      logout,
    }),
    [user, ready, login, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const context = useContext(Ctx);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

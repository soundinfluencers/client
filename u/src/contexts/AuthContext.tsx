import {
  createContext,
  type ReactNode, useCallback,
  useContext,
  useEffect, useMemo,
  useState,
} from "react";
import { logoutApi } from "../api/auth/auth.api.ts";
import { refreshAccessToken } from "@/api/refresh.manager.ts";
import { queryClient } from "@/main.tsx";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  isAuthReady: boolean;
}

let accessTokenStore: string | null = null;

export const tokenStorage = {
  get: () => accessTokenStore,
  set: (token: string | null) => (accessTokenStore = token),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    tokenStorage.set(token);
  }, []);

  // const setAccessToken = (token: string | null) => {
  //     setAccessTokenState(token);
  //     tokenStorage.set(token);
  // };

  useEffect(() => {
    console.log(accessToken, 'accessToken')
  }, [accessToken]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
      queryClient.clear();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setAccessToken(null);
      // window.location.href = "/auth";
    }
  }, [setAccessToken]);

  useEffect(() => {
    const refresh = async () => {
      try {
        await refreshAccessToken(setAccessToken);
      } catch {
        setAccessToken(null);
      } finally {
        setIsAuthReady(true);
      }
    };

    refresh();
  }, [setAccessToken]);

  const value = useMemo(
    () => ({ accessToken, setAccessToken, logout, isAuthReady }),
    [accessToken, setAccessToken, logout, isAuthReady],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

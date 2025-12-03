import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import $api from "../api/api.ts";
import { logoutApi } from "../api/auth/auth.api.ts";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

let accessTokenStore: string | null = null;

export const tokenStorage = {
  get: () => accessTokenStore,
  set: (token: string | null) => (accessTokenStore = token),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  console.log(accessToken, "acct");
  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    tokenStorage.set(token);
  };

  useEffect(() => {
    const refresh = async () => {
      try {
        const { data } = await $api.post<{ accessToken: string }>(
          "/auth/refresh"
        );

        setAccessToken(data.accessToken);
      } catch {
        if (window.location.pathname !== "/auth") {
          logout();
        }
      }
    };

    refresh();
  }, []);

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setAccessToken(null);
      window.location.href = "/auth";
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

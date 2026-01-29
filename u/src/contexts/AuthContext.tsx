import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {$auth} from "../api/api.ts";
import { logoutApi } from "../api/auth/auth.api.ts";

interface AuthContextType {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    logout: () => void;
    isAuthReady: boolean;
};

let accessTokenStore: string | null = null;

export const tokenStorage = {
  get: () => accessTokenStore,
  set: (token: string | null) => (accessTokenStore = token),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessTokenState] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const setAccessToken = (token: string | null) => {
        setAccessTokenState(token);
        tokenStorage.set(token);
    };

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

    useEffect(() => {
        const refresh = async () => {
            try {
                const res = await $auth.post("/auth/refresh");
                setAccessToken(res.data.data.accessToken);
            } catch {
                setAccessToken(null);
            } finally {
                setIsAuthReady(true);
            }
        };

        refresh();
    }, []);

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken, logout, isAuthReady }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

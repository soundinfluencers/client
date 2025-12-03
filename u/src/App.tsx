import { Routes, Route, Navigate } from "react-router-dom";
import { TabBar } from "./components/layout/tab-bar/TabBar";
import { routes } from "./router/routes";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { setupInterceptors } from "./api/api";
import { PrivateRoute } from "./router/components/PrivateRoute.tsx";
import { PublicRoute } from "./router/components/PublicRoute.tsx";
import "./app.scss";
function App() {
  const { accessToken, setAccessToken, logout } = useAuth();

  useEffect(() => {
    setupInterceptors(setAccessToken, logout);
  }, []);

  return (
    <div>
      <TabBar isAuthenticated={!!accessToken} />
      {accessToken && <div className="proceed"></div>}
      <Routes>
        {routes.map(({ path, component: Component, name, isProtected }) => (
          <Route
            key={name}
            path={path}
            element={
              isProtected ? (
                <PrivateRoute>
                  <Component />
                </PrivateRoute>
              ) : (
                <PublicRoute>
                  <Component />
                </PublicRoute>
              )
            }
          />
        ))}

        {/* fallback */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </div>
  );
}

export default App;

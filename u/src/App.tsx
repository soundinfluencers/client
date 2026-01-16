import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

import { TabBar } from "./components/layout/tab-bar/TabBar";
import { Proceed } from "./components";

import { useAuth } from "./contexts/AuthContext";
import { setupInterceptors } from "./api/api";

import { PrivateRoute } from "./router/components/PrivateRoute";
import { PublicRoute } from "./router/components/PublicRoute";
import { routes } from "./router/routes";

// influencer
import { DashboardLayout } from "./pages/influencer/dashboard-layout/DashboardLayout";
import { PromosList } from "./pages/influencer/dashboard-layout/components/promos-list/PromosList";
import { CampaignHistoryList } from "./pages/influencer/dashboard-layout/components/campaign-history-list/CampaignHistoryList";
import { NewPromos } from "./pages/influencer/promos/new-promos/NewPromos";
import { Distributing } from "./pages/influencer/promos/distributing/Distributing";
import { Completed } from "./pages/influencer/promos/completed/Completed";
import { InvoicePage } from "./pages/influencer/create-invoice/InvoicePage";
import { InvoicesDetails } from "./pages/influencer/invoices-details/InvoicesDetails";
import { AccountSettingInfluencer } from "./pages/influencer/account-setting/AccountSettingInfluencer";

// client
import { HomePage } from "./pages/home/HomePage";

import "./app.scss";
import { useUser } from "./store/get-user";
import { RootRedirect } from "./router/components/rootRedirect";

function App() {
  const { accessToken, setAccessToken, logout } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setupInterceptors(setAccessToken, logout);
  }, []);

  return (
    <div>
      <TabBar isAuthenticated={!!accessToken} />
      {accessToken && user?.role === "client" && <Proceed />}

      <Routes>
        {/* ---------- ROOT SWITCH ---------- */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <RootRedirect />
            </PrivateRoute>
          }
        />

        {/* ---------- CLIENT ---------- */}
        <Route
          path="/client"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />

        {/* ---------- INFLUENCER ---------- */}
        <Route
          path="/influencer"
          element={
            <PrivateRoute>
              <Outlet />
            </PrivateRoute>
          }>
          {/* ---------- HERO PAGES ---------- */}
          <Route element={<DashboardLayout />}>
            <Route index element={<PromosList />} />
            <Route path="promos" element={<PromosList />} />
            <Route path="campaign-history" element={<CampaignHistoryList />} />
          </Route>

          {/* ---------- PAGES WITHOUT HERO ---------- */}
          <Route path="promos/new-promos" element={<NewPromos />} />
          <Route path="promos/distributing" element={<Distributing />} />
          <Route path="promos/completed" element={<Completed />} />

          <Route path="create-invoice" element={<InvoicePage />} />
          <Route path="invoices" element={<InvoicesDetails />} />
          <Route
            path="account-setting"
            element={<AccountSettingInfluencer />}
          />
        </Route>

        {/* ---------- PUBLIC & OTHER ROUTES ---------- */}
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

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </div>
  );
}

export default App;

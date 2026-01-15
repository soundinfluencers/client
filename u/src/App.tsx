import { Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import { TabBar } from "./components/layout/tab-bar/TabBar";
import { routes } from "./router/routes";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { setupInterceptors } from "./api/api";
import { PrivateRoute } from "./router/components/PrivateRoute.tsx";
import { PublicRoute } from "./router/components/PublicRoute.tsx";
import "./app.scss";
import { Proceed } from "./components";
import { DashboardLayout } from "./pages/influencer/dashboard-layout/DashboardLayout.tsx";
import { PromosList } from "./pages/influencer/dashboard-layout/components/promos-list/PromosList.tsx";
import { CampaignHistoryList } from "./pages/influencer/dashboard-layout/components/campaign-history-list/CampaignHistoryList.tsx";
import { NewPromos } from "./pages/influencer/promos/new-promos/NewPromos.tsx";
import { Distributing } from "./pages/influencer/promos/distributing/Distributing.tsx";
import { Completed } from "./pages/influencer/promos/completed/Completed.tsx";
import { InvoicePage } from "./pages/influencer/create-invoice/InvoicePage.tsx";
import { InvoicesDetails } from "./pages/influencer/invoices-details/InvoicesDetails.tsx";
import { AccountSettingInfluencer } from "./pages/influencer/account-setting/AccountSettingInfluencer.tsx";
import { useUserStore } from "./store/user/useUserStore.ts";

function App() {
  const { accessToken, setAccessToken, logout } = useAuth();
  const { user } = useUserStore();

  useEffect(() => {
    setupInterceptors(setAccessToken, logout);
  }, []);

  return (
    <div>
      <TabBar isAuthenticated={!!accessToken} />
      {accessToken && user?.role === "client" && <Proceed />}
      <Routes>
        {/* ---------- INFLUENCER DASHBOARD ---------- */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Outlet />
            </PrivateRoute>
          }
        >
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
          <Route path="account-setting" element={<AccountSettingInfluencer />} />
        </Route>

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
            }></Route>
        ))}

        {/* fallback */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </div>
  );
}

export default App;

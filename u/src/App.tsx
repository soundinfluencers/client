import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

import { TabBar } from "@/components";

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
import { InvoicesHistory } from "./pages/influencer/invoices-details/InvoicesHistory.tsx";
import { AccountSetting } from "./pages/influencer/account-setting/AccountSetting.tsx";
import { ContactSupport } from "@/pages/influencer/contact-support/ContactSupport.tsx";
import { InvoiceDetails } from "@/pages/influencer/invoice-details/InvoiceDetails.tsx";

// client

import "./app.scss";
import { RootRedirect } from "./router/components/rootRedirect";
import { ToastContainer } from "react-toastify";
import { PaymentDetails } from "@/pages/influencer/payment-details/PaymentDetails.tsx";
import { SocialAccounts } from "@/pages/influencer/social-accounts/SocialAccounts.tsx";
import { InfluencerTermsPage } from "@/pages/auth/terms/influencer/InfluencerTermsPage.tsx";
import { Agreement } from "@/pages/influencer/agreement/Agreement.tsx";
import { HomePage } from "@/client-side";
import {
  EditPassword
} from "@/pages/influencer/account-setting/components/edit-password-flow/edit-password/EditPassword.tsx";
import {
  AccountSettingMain
} from "@/pages/influencer/account-setting/components/account-setting-main/AccountSettingMain.tsx";


function App() {
  const { setAccessToken, logout } = useAuth();

  useEffect(() => {
    const cleanup = setupInterceptors(setAccessToken, logout);
    return cleanup;
  }, [setAccessToken, logout]);

  return (
    <div>
      <ToastContainer />
      <TabBar />

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
          <Route path="invoices-history" element={<InvoicesHistory />} />
          {/* ---------- NEW ROUTES ---------- */}
          <Route
            path="account-setting"
            element={<AccountSetting />}
          >
            <Route index element={<AccountSettingMain />} />
            <Route path="edit-password" element={<EditPassword />} />
          </Route>

          <Route
            path="social-accounts"
            element={<SocialAccounts />}
          />
          <Route
            path="invoice-details"
            element={<InvoiceDetails />}
          />
          <Route
            path="payment-details"
            element={<PaymentDetails />}
          />
          <Route
            path="contact-support"
            element={<ContactSupport />}
          />
          {/*<Route*/}
          {/*  path="agreement"*/}
          {/*  element={<Agreement />}*/}
          {/*/>*/}
        </Route>

        {/* ---------- PUBLIC & OTHER ROUTES ---------- */}
        <Route path="/terms/influencer" element={<InfluencerTermsPage />} />
        <Route
          path="/profile/agreement/:influencerId"
          element={<Agreement />}
        />

        {/* ---------- RENDER ROUTES (mb rebuild structure) ---------- */}
        {routes.map(({ path, component: Component, isProtected }) => (
          <Route
            key={path}
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

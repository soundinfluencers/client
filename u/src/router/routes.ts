import type { IRoute } from "./navigation.types.ts";
import { LoginPage } from "../pages/auth/login/LoginPage.tsx";
import { AuthPage } from "../pages/auth/auth/AuthPage.tsx";
import { SignupPage } from "../pages/auth/signup/SignupPage.tsx";
import { ForgotPasswordPage } from "../pages/auth/forgot/ForgotPasswordPage.tsx";
import { HomePage } from "../pages/home/HomePage.tsx";

// Client Imports
import { TermsPage } from "../pages/auth/terms/TermsPage.tsx";
import { BespokeCampaign } from "../pages/client/BespokeCampaign/bespoke-campaign.tsx";
import { CampaignCreatorPage } from "../pages/client/CampaignCreatorPage/CampaignCreatorPage.tsx";
import { AccountSetting } from "../pages/client/Account-Settings/account-settings.tsx";
import { CamapignStrategy } from "../pages/client/campaign-strategy/campaign-strategy.tsx";
import { CampaignPostContent } from "../pages/client/campaign-post-content/campaign-post-content.tsx";
import { PaymentCampaign } from "../pages/client/payment-campaign/payment-campaign.tsx";

// Influencer Imports
import { InfluencerTermsPage } from "../pages/auth/terms/influencer/InfluencerTermsPage.tsx";
// import { Promos } from "../pages/influencer/promos/promos-list/Promos.tsx";
// import { InvoicePage } from "../pages/influencer/create-invoice/InvoicePage.tsx";
// import { InvoicesDetails } from "../pages/influencer/invoices-details/InvoicesDetails.tsx";
// import { NewPromos } from "../pages/influencer/promos/new-promos/NewPromos.tsx";
// import { Distributing } from "../pages/influencer/promos/distributing/Distributing.tsx";
// import { Completed } from "../pages/influencer/promos/completed/Completed.tsx";
// import { AccountSettingInfluencer } from "../pages/influencer/account-setting/AccountSettingInfluencer.tsx";
// import { CampaignHistory } from "../pages/influencer/campaign-history/CampaignHistory.tsx";
// import { DashboardLayout } from "../pages/influencer/dashboard-layout/DashboardLayout.tsx";


export const routes: IRoute[] = [
  {
    name: "Auth",
    path: "/auth",
    component: AuthPage,
    isProtected: false,
  },
  {
    name: "ForgotPassword",
    path: "/forgot-password",
    component: ForgotPasswordPage,
    isProtected: false,
  },
  {
    name: "Login",
    path: "/login",
    component: LoginPage,
    isProtected: false,
  },
  {
    name: "SignupClient",
    path: "/signup/client",
    component: SignupPage,
    isProtected: false,
  },
  {
    name: "SignupInfluencer",
    path: "/signup/influencer",
    component: SignupPage,
    isProtected: false,
  },
  {
    name: "Terms",
    path: "/terms/client",
    component: TermsPage,
    isProtected: false,
  },
  {
    name: "Terms",
    path: "/terms/influencer",
    component: InfluencerTermsPage,
    isProtected: false,
  },
  {
    name: "Home",
    path: "/client/home",
    component: HomePage,
    isProtected: true,
  },
  {
    name: "CreateCampaign",
    path: "/client/CreateCampaign",
    component: CampaignCreatorPage,
    isProtected: true,
  },
  {
    name: "Content",
    path: "/client/CreateCampaign/Content",
    component: CampaignPostContent,
    isProtected: true,
  },
  {
    name: "Strategy",
    path: "/client/CreateCampaign/Content/Strategy",
    component: CamapignStrategy,
    isProtected: true,
  },
  {
    name: "Payment",
    path: "/client/CreateCampaign/Content/Strategy/Payment",
    component: PaymentCampaign,
    isProtected: true,
  },
  {
    name: "BespokeCampaign",
    path: "/client/BespokeCampaign",
    component: BespokeCampaign,
    isProtected: true,
  },
  {
    name: "AccountSetting",
    path: "/client/AccountSetting",
    component: AccountSetting,
    isProtected: true,
  },

  //Influencer Routes
  // {
  //   name: "Promos",
  //   path: "/dashboard/promos",
  //   component: DashboardLayout,
  //   isProtected: false,
  // },
  // {
  //   name: "NewPromos",
  //   path: "/dashboard/promos/new-promos",
  //   component: NewPromos,
  //   isProtected: false,
  // },
  // {
  //   name: "DistributingPromos",
  //   path: "promos/distributing",
  //   component: Distributing,
  //   isProtected: false,
  // },
  // {
  //   name: "CompletedPromos",
  //   path: "/dashboard/promos/completed",
  //   component: Completed,
  //   isProtected: false,
  // },
  // {
  //   name: "CreateInvoice",
  //   path: '/dashboard/create-invoice',
  //   component: InvoicePage,
  //   isProtected: false,
  // },
  // {
  //   name: "Invoices",
  //   path: '/dashboard/invoices',
  //   component: InvoicesDetails,
  //   isProtected: false,
  // },
  // {
  //   name: "AccountSettingInfluencer",
  //   path: "/dashboard/account-setting",
  //   component: AccountSettingInfluencer,
  //   isProtected: false,
  // },
  // {
  //   name: "CampaignHistory",
  //   path: "/dashboard/campaign-history",
  //   component: CampaignHistory,
  //   isProtected: false,
  // }
];
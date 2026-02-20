import type { IRoute } from "./navigation.types.ts";
import { LoginPage } from "../pages/auth/login/LoginPage.tsx";
import { AuthPage } from "../pages/auth/auth/AuthPage.tsx";
import { SignupPage } from "../pages/auth/signup/SignupPage.tsx";
import { ForgotPasswordPage } from "../pages/auth/forgot/ForgotPasswordPage.tsx";

// Client Imports
import { TermsPage } from "../pages/auth/terms/TermsPage.tsx";

import {
  AccountSetting,
  AddInfluencerBuildCampaign,
  BespokeCampaign,
  CampaignCreatorPage,
  CampaignPage,
  CampaignPostContent,
  CampaignSharePage,
  CampaignStrategy,
  HomePage,
  InvoiceDetails,
  InvoicesHistory,
  PaymentCampaign,
  PostContentAdd,
} from "@/client-side/index.ts";
import { ContactSupport } from "@/pages/influencer/contact-support/ContactSupport.tsx";

// import { CampaignAddInfluencer } from "@/pages/client/campaign-add-infuencer/campaign-add-infuencer.tsx";

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
  // {
  //   name: "Terms",
  //   path: "/terms/influencer",
  //   component: InfluencerTermsPage,
  //   isProtected: false,
  // },
  {
    name: "Home",
    path: "/client",
    component: HomePage,
    isProtected: true,
  },
  {
    name: "CreateCampaign",
    path: "/client/create-campaign",
    component: CampaignCreatorPage,
    isProtected: true,
  },
  {
    name: "Content",
    path: "/client/create-campaign/content",
    component: CampaignPostContent,
    isProtected: true,
  },
  {
    name: "Strategy",
    path: "/client/create-campaign/content/strategy",
    component: CampaignStrategy,
    isProtected: true,
  },
  {
    name: "Payment",
    path: "/client/create-campaign/content/strategy/payment",
    component: PaymentCampaign,
    isProtected: true,
  },
  {
    name: "PaymentDraft",
    path: "/client/campaign/payment",
    component: PaymentCampaign,
    isProtected: true,
  },
  {
    name: "BespokeCampaign",
    path: "/client/agency-campaign",
    component: BespokeCampaign,
    isProtected: true,
  },
  {
    name: "AccountSetting",
    path: "/client/account-settings",
    component: AccountSetting,
    isProtected: true,
  },
  {
    name: "Campaign",
    path: "/client/campaign",
    component: CampaignPage,
    isProtected: true,
  },
  {
    name: "CampaignAddInfluencer",
    path: "/client/campaign/add-influencer",
    component: AddInfluencerBuildCampaign,
    isProtected: true,
  },
  {
    name: "AddInfluencerPostContent",
    path: "/client/campaign/add-influencer/add-influencer-content",
    component: PostContentAdd,
    isProtected: true,
  },
  {
    name: "PromoShare",
    path: "/promo-share/:id/:type",
    component: CampaignSharePage,
    isProtected: false,
  },
  {
    name: "InvoiceHistory",
    path: "/client/invoice-history",
    component: InvoicesHistory,
    isProtected: true,
  },
  {
    name: "InvoiceDetails",
    path: "/client/invoice-details",
    component: InvoiceDetails,
    isProtected: true,
  },
  {
    name: "ContactSupport",
    path: "/client/contact-support",
    component: ContactSupport,
    isProtected: true,
  },
];

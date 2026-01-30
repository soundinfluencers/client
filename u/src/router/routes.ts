import type { IRoute } from "./navigation.types.ts";
import { LoginPage } from "../pages/auth/login/LoginPage.tsx";
import { AuthPage } from "../pages/auth/auth/AuthPage.tsx";
import { SignupPage } from "../pages/auth/signup/SignupPage.tsx";
import { ForgotPasswordPage } from "../pages/auth/forgot/ForgotPasswordPage.tsx";

// Client Imports
import { TermsPage } from "../pages/auth/terms/TermsPage.tsx";
import { BespokeCampaign } from "../pages/client/bespoke-campaign/bespoke-campaign.tsx";
import { CampaignCreatorPage } from "../pages/client/campaign-creator-page/campaign-creator-page.tsx";

import { CampaignStrategy } from "../pages/client/campaign-strategy/campaign-strategy.tsx";
import { CampaignPostContent } from "../pages/client/campaign-post-content/campaign-post-content.tsx";
import { PaymentCampaign } from "../pages/client/payment-campaign/payment-campaign.tsx";
import { InfluencerTermsPage } from "../pages/auth/terms/influencer/InfluencerTermsPage.tsx";

import { CampaignPage } from "@/pages/client/campaign/campaign-page.tsx";
import { CampaignSharePage } from "@/pages/client/campaign-share/campaig-share-page.tsx";
import { HomePage } from "@/pages/client/client-dashboard/home-page.tsx";
import { AccountSetting } from "@/pages/client/account-settings/account-settings.tsx";

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
    path: "/client",
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
    component: CampaignStrategy,
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
  {
    name: "Campaign",
    path: "/client/campaign",
    component: CampaignPage,
    isProtected: true,
  },
  {
    name: "PromoShare",
    path: "/promo-share/:id/:type",
    component: CampaignSharePage,
    isProtected: false,
  },
];

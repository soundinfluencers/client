import type { IRoute } from "./navigation.types.ts";
import { LoginPage } from "../pages/auth/login/LoginPage.tsx";
import { AuthPage } from "../pages/auth/auth/AuthPage.tsx";
import { SignupPage } from "../pages/auth/signup/SignupPage.tsx";
import { ForgotPasswordPage } from "../pages/auth/forgot/ForgotPasswordPage.tsx";
import { TermsPage } from "../pages/auth/terms/TermsPage.tsx";
import { HomePage } from "../pages/home/HomePage.tsx";
import { BespokeCampaign } from "../pages/client/BespokeCampaign/bespoke-campaign.tsx";
import { CampaignPostContent } from "../pages/client/CampaignCreatorPage/campaign-post-content/campaign-post-content.tsx";
import { CampaignCreatorPage } from "../pages/client/CampaignCreatorPage/CampaignCreatorPage.tsx";
import { AccountSetting } from "../pages/client/Account-Settings/account-settings.tsx";

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
    name: "SignupInfluncer",
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
    component: TermsPage,
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
];

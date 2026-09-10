import type { ComponentType } from "react";

export type TypeCommonRoutes = {
  Auth: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  SignupClient: undefined;
  SignupInfluncer: undefined;
  Home: undefined;
  Terms: undefined;
  CreateCampaign: undefined;
};

export type TypeClientRoutes = {
  Content: undefined;
  Strategy: undefined;
  Payment: undefined;
  PaymentDraft: undefined;
  BespokeCampaign: undefined;
  AccountSetting: undefined;
  Campaign: undefined;
  CampaignAddInfluencer: undefined;
  AddInfluencerPostContent: undefined;
  PromoShare: undefined;
  AiChat: undefined;
  InvoiceHistory: undefined;
  InvoiceDetails: undefined;
  ContactSupport: undefined;
  SignupClient: undefined;
};

export type TypeInfluencerRoutes = {
  SignupInfluencer: undefined;
};

export type TypeRootStackParamList = TypeCommonRoutes &
  TypeClientRoutes &
  TypeInfluencerRoutes;

export interface IRoute {
  name: keyof TypeRootStackParamList;
  path: string;
  component: ComponentType;
  isProtected: boolean;
  children?: IRoute[];
}

export type TPromoStatus = "pending" | "distributing" | "completed";
export type TConfirmationType = "accept" | "decline" | "wait";
export type TPromoDecision = Exclude<TConfirmationType, "wait">;
export type TClosedStatusType = "close" | "wait";
export type TFilterStatus = "new" | "close" | "ongoing" | "all";

export type socialMediaType =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "spotify"
  | "press"
  | "soundcloud"
  | "multipromo"
  ;

export interface NewPromoBrief {
  dateRequest?: string | null;
  mainLink?: string | null;
  description?: string | null;
  taggedUser?: string | null;
  taggedLink?: string | null;
  additionalBrief?: string | null;
}

export interface StandaloneNewPromo extends NewPromoBrief {
  promoType: "standalone";
  campaignId: string;
  influencerId: string;
  addedAccountsId: string;
  socialAccountId: string;
  logoUrl?: string | null;
  campaignName: string;
  username: string;
  accountSocialMedia: socialMediaType;
  createdAt: string;
  clientName: string;
}

export interface BundlePromoAccount extends NewPromoBrief {
  addedAccountsId: string;
  socialAccountId: string;
  username: string;
  logoUrl?: string | null;
  accountSocialMedia: socialMediaType;
  followers: number;
  reward: number;
  bundlePosition: number;
  isAddedToCampaign: boolean;
}

export interface BundleNewPromo {
  promoType: "bundle";
  campaignId: string;
  campaignBundleId: string;
  bundleId: string;
  influencerId: string;
  campaignName: string;
  clientName: string;
  createdAt: string;
  acceptancePolicy: "all_or_nothing";
  currency: string;
  originalReward: number;
  bundleReward: number;
  accounts: BundlePromoAccount[];
}

export type NewPromo = StandaloneNewPromo | BundleNewPromo;

export interface IPromo {
  campaignId: string;
  influencerId: string;
  addedAccountsId: string;
  socialAccountId: string;
  campaignName: string;
  userName: string;
  reward: number;
  socialMedia: socialMediaType;
  createdAt: string;
  statusCampaign: TPromoStatus;
  closedStatus: TClosedStatusType;
  confirmation: TConfirmationType;
}

export interface IPromoDetailsModel {
  campaignId: string;
  influencerId: string;
  addedAccountsId: string;
  socialAccountId: string;
  campaignName: string;
  username: string;
  accountSocialMedia: socialMediaType;
  createdAt: string;
  clientName: string;
  reward: number;
  logoUrl: string;
  postLink: string;
  dateRequest: string;
  mainLink: string;
  description: string;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
  statusCampaign: TPromoStatus;
  closedStatus: TClosedStatusType;
  confirmation: TConfirmationType;
}

export type TPromoDetailsCardModel = IPromoDetailsModel | StandaloneNewPromo;

export type TStandalonePromoDecisionRequest = Pick<
  IPromoDetailsModel,
  "campaignId" | "addedAccountsId" | "username"
> & {
  campaignResponse: TPromoDecision;
};

export interface TBundlePromoDecisionRequest {
  campaignId: string;
  campaignBundleId: string;
  selectedAddedAccountsIds: string[];
  campaignResponse: TPromoDecision;
}

export type TPromoDecisionRequest =
  | TStandalonePromoDecisionRequest
  | TBundlePromoDecisionRequest;

export type TAcceptDeclineRequestPromoModel =
  TStandalonePromoDecisionRequest;

export type TDetailsField = {
  key: keyof IPromoDetailsModel | keyof StandaloneNewPromo;
  label: string;
  format?: (value: number, promo: TPromoDetailsCardModel) => string;
  copyable?: boolean;
  linkable?: boolean;
  icon?: string;
};

export type fieldsConfig = Record<socialMediaType, TDetailsField[]>;

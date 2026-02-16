import type { SocialMediaType } from "@/types/utils/constants.types";

export interface Campaign {
  campaignId: string;
  addedAccountsId: string;
  campaignName: string;
  campaignSocialMedia: SocialMediaType;
  date: string;
  price: number;
  socialAccountId: string;
  status: number;
  statusLabel: string;
}
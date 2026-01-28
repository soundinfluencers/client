import type { SocialMediaType } from "@/types/utils/constants.types";

export interface Campaign {
  campaignId: string;
  campaignName: string;
  campaignSocialMedia: SocialMediaType;
  date: string;
  price: number;
  status: number;
  statusLabel: string;
};
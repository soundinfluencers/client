import type { SocialMediaType } from "@/types/utils/constants.types";

export type CampaignStatusType =
  | "pending"
  | "distributing"
  | "completed"
  | "draft";

export interface CampaignForList {
  _id: string;
  campaignName: string;
  socialMedia: SocialMediaType | "multipromo";
  creationDate: string;
  price: string;
  status: CampaignStatusType;
}

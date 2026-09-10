import type { SocialMediaType } from "@/types/utils/constants.types";

export type CampaignStatusType =
  | "pending"
  | "under_review"
  | "closed"
  | "distributing"
  | "completed"
  | "draft"
  | "proposal";

export interface CampaignForList {
  _id: string;
  campaignName: string;
  socialMedia: SocialMediaType | "multipromo";
  creationDate: string;
  price: string;
  status: CampaignStatusType;
}

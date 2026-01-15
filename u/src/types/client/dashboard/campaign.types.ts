import type { SocialMediaType } from "@/types/utils/constants.types";

export type CampaignStatusType =
  | "Pending"
  | "Distributing"
  | "Completed"
  | "Draft";

export interface CampaignForList {
  _id: string;
  campaignName: string;
  socialMedia: SocialMediaType | "multipromo";
  creationDate: string;
  price: string;
  status: CampaignStatusType;
}

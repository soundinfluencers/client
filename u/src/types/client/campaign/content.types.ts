import type { ObjectId } from "./ids.types";
import type { SocialMedia, SocialMediaGroup } from "./enums.types";

export interface CampaignContentDescription {
  _id: ObjectId;
  description: string;
}

export interface CampaignContentItem {
  _id: ObjectId;
  socialMedia: SocialMedia;
  socialMediaGroup: SocialMediaGroup;
  mainLink: string;
  descriptions: CampaignContentDescription[];
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
}

export interface SelectedContentRef {
  campaignContentItemId: ObjectId;
  descriptionId: ObjectId;
}

export interface SelectedCampaignContentItemSnapshot {
  _id: ObjectId;
  mainLink: string;
  description: string;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
}

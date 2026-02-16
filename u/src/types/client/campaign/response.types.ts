import type { ObjectId } from "./ids.types";
import type { CampaignBackendStatus, SocialMedia } from "./enums.types";

import type {
  CampaignAddedAccount,
  CampaignContentItem,
} from "@/pages/client/types";

export interface CampaignResponse {
  campaignId: ObjectId;
  campaignName: string;
  canEdit: boolean;
  socialMedia: SocialMedia;

  creationDate: string; // не ISO у тебя сейчас
  price: number;

  status: CampaignBackendStatus;

  addedAccounts: CampaignAddedAccount[];
  campaignContent: CampaignContentItem[];

  cpm: number;
  shareLink: string;

  totalFollowers: number;
  totalImpressions: number;
  totalLikes: number;
  totalSaves: number;
  totalComments: number;
  totalShares: number;

  isCpmAndResultHidden: boolean;
  isPriceHidden: boolean;

  hiddenColumns: string[];
}

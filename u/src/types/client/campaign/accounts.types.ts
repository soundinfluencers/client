import type { ObjectId, ISODateString } from "./ids.types";
import type {
  SocialMedia,
  ConfirmationStatus,
  ClosePromo,
  DateRequest,
} from "./enums.types";
import type { SelectedContentRef } from "@/pages/client/types";
import type { SelectedCampaignContentItemSnapshot } from "@/types/store/index.types";

export interface CampaignAddedAccount {
  _id: ObjectId;

  influencerId: ObjectId;
  socialAccountId: ObjectId;
  addedAccountsId: ObjectId;
  socialMedia: SocialMedia;

  username: string;

  price: number;
  publicPrice: number;

  followers: number;

  confirmation: ConfirmationStatus;
  closePromo: ClosePromo;

  selectedContent: SelectedContentRef;

  dateRequest: DateRequest;

  postLink: string;
  screenshot: string;

  impressions: number | null;
  like: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;

  rating: number | null;
  adminChecked: boolean;

  createdAt: ISODateString;
  updatedAt: ISODateString;

  selectedCampaignContentItem?: SelectedCampaignContentItemSnapshot;
}

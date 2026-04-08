import type { ApiResponse, CampaignDraftStep, CampaignStatus, MongoId, SocialMedia } from "./common";
import type {
    CampaignAccountRequestItem,
    CampaignAddedAccount,
    DraftAccountItem,
} from "./account";
import type { CampaignContentItem } from "./content";
import type { PaymentDetails } from "./payment";

export type CampaignSummary = {
    _id: MongoId;
    campaignName: string;
    socialMedia: SocialMedia;
    creationDate: string;
    price: number;
    status: CampaignStatus;
};

export type GetCampaignsResponse = ApiResponse<{
    campaigns: CampaignSummary[];
}>;

export type CreateCampaignPayload = {
    campaignName: string;
    socialMedia: SocialMedia;
    campaignPrice: number;
    addedAccounts: CampaignAccountRequestItem[];
    campaignContent: CampaignContentItem[];
    paymentDetails: PaymentDetails;
};

export type UpdateCampaignPayload = {
    campaignName: string;
    addedAccounts: CampaignAccountRequestItem[];
    campaignContent: CampaignContentItem[];
};

export type CampaignDetails = {
    campaignId: MongoId;
    campaignName: string;
    socialMedia: SocialMedia;
    creationDate: string;
    price: number;
    status: CampaignStatus;
    addedAccounts: CampaignAddedAccount[];
    campaignContent: CampaignContentItem[];
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
    cpm: number;
    canEdit: boolean;
};

export type GetCampaignDetailsResponse = ApiResponse<CampaignDetails>;
export type GetCampaignShareResponse = ApiResponse<CampaignDetails>;

export type DraftPayload = {
    socialMedia: SocialMedia;
    step: CampaignDraftStep;
    addedAccounts: DraftAccountItem[];
    draftId?: MongoId;
    campaignContent?: CampaignContentItem[];
    campaignName: string;
};

export type CampaignDraft = {
    _id: MongoId;
    step: CampaignDraftStep;
    socialMedia: SocialMedia;
    addedAccounts: DraftAccountItem[];
    campaignName: string;
    campaignContent: CampaignContentItem[];
    totalPrice: number;
};

export type GetCampaignDraftResponse = ApiResponse<CampaignDraft>;
export type CreateCampaignDraftResponse = ApiResponse<CampaignDraft>;
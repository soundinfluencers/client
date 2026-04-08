export type ApiResponse<T> = {
    statusCode: number;
    message: string;
    data: T;
};

export type MongoId = string;
export type CampaignListViewMode = "table" | "grid";
export type SocialMedia =
    | "instagram"
    | "tiktok"
    | "youtube"
    | "facebook"
    | "spotify"
    | "soundcloud"
    | "press"
    | "multipromo";

export type CampaignStatus =
    | "under_review"
    | "approved"
    | "rejected"
    | "draft"
    | string;

export type CampaignDraftStep =
    | "addAccounts"
    | "addContent"
    | "strategyTable";

export type ConfirmationStatus = "accept" | "decline" | "pending" | string;
export type ClosePromoStatus = "close" | "open" | string;
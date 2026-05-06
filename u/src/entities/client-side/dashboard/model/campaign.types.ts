export type CampaignStatus =
    | "draft"
    | "proposal"
    | "under_review"
    | "distributing"
    | "closed";

export type CampaignFilterStatus = CampaignStatus | "all";

export type CampaignSocialMedia =
    | "instagram"
    | "youtube"
    | "tiktok"
    | "facebook"
    | "spotify"
    | "multipromo"
    | string;

export type CampaignListItem = {
    id: string;
    campaignName: string;
    socialMedia: CampaignSocialMedia;
    creationDate: string;
    price: number;
    status: CampaignStatus;
    draftStep?: string;
};
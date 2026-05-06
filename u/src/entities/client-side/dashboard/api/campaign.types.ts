export type CampaignStatusDto =
    | "draft"
    | "proposal"
    | "under_review"
    | "distributing"
    | "closed";

export type CampaignListItemDto = {
    _id: string;
    campaignName: string;
    socialMedia: string;
    creationDate: string;
    price: number;
    status: CampaignStatusDto;
    draftStep?: string;
};

export type GetCampaignsResponseDto = {
    statusCode: number;
    message: string;
    data: {
        campaigns: CampaignListItemDto[];
    };
};
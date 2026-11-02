import type { DisplayCurrency } from "@/shared/functions/formatCurrency.ts";

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
    displayCurrency: DisplayCurrency;
    currency: DisplayCurrency;
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

import $api from "@/api/api.ts";
import type { CreateRegularCampaignRequest } from "@/api/client/campaign/create-campaign.types";
import type { CampaignContentItem } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";
import type { DisplayCurrency } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";

export type CreateCampaignProposalRequest = Pick<CreateRegularCampaignRequest,
    "campaignName" | "socialMedia" | "campaignPrice" | "addedAccounts"> & {
    displayCurrency: DisplayCurrency;
    campaignContent: Array<Omit<CampaignContentItem, "additionalBrief"> & {
        additionalBrief: Array<{ _id: string; additionalBrief: string }>;
    }>;
};

export const postCampaignProposal = async (payload: CreateCampaignProposalRequest) => {
    return $api.post("/proposal-system", payload);
};

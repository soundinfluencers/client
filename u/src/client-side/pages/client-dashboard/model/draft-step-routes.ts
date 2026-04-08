import { CampaignDraftLatestStep } from "@/client-side/types/draft.types";

export const draftStepRouteMap: Record<CampaignDraftLatestStep, string> = {
    [CampaignDraftLatestStep.addAccounts]: "/client/create-campaign",
    [CampaignDraftLatestStep.addContent]: "/client/create-campaign/content",
    [CampaignDraftLatestStep.strategyTable]: "/client/campaign",
};
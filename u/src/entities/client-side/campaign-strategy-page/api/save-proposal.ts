import $api from "@/api/api.ts";
import type {
    CreateProposalCampaignRequest,
    CreateProposalOptionResponse,
} from "@/entities/client-side/campaign/model/campaign-api.types";
import {
    parseCreateProposalOptionResponse,
} from "@/entities/client-side/campaign/model/proposal-option-response";


export const postCampaignProposal = async (
    payload: CreateProposalCampaignRequest,
) => {
    const response = await $api.post<CreateProposalOptionResponse>(
        "/proposal-system",
        payload,
    );

    return parseCreateProposalOptionResponse(response.data);
};

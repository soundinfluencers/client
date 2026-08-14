import api from "@/api/api.ts";
import type {
    ApiResponse,
    CreateProposalOptionResponse,
    ProposalCampaignDto,
    ProposalSystemPostBody,
    UpdateProposalCampaignRequest,
} from "../model/campaign-api.types";
import {
    parseCreateProposalOptionResponse,
} from "../model/proposal-option-response";

export const postProposalSystem = async (
    body: ProposalSystemPostBody,
    campaignId?: string,
) => {
    const response = await api.post<CreateProposalOptionResponse>("/proposal-system", body, {
        params: campaignId
            ? {
                campaignId,
            }
            : undefined,
    });

    return parseCreateProposalOptionResponse(response.data);
};

export const patchProposalOption = async (
    campaignId: string,
    optionIndex: number,
    body: UpdateProposalCampaignRequest,
) => {
    return api.patch<ApiResponse<ProposalCampaignDto>>(
        `/proposal-system/${campaignId}`,
        body,
        {
            params: {
                optionIndex,
            },
        },
    );
};

export const deleteProposalOption = async (
    campaignId: string,
    optionIndex: number,
) => {
    return api.delete<ApiResponse<ProposalCampaignDto>>(
        `/proposal-system/${campaignId}`,
        {
            params: {
                optionIndex,
            },
        },
    );
};

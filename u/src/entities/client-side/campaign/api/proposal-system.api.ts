import api from "@/api/api.ts";
import type {
    ApiResponse,
    CampaignPatchBody,
    ProposalCampaignDto,
    ProposalSystemPostBody,
} from "../model/campaign-api.types";

export const postProposalSystem = async (
    body: ProposalSystemPostBody,
    campaignId?: string,
) => {
    return api.post<ApiResponse<ProposalCampaignDto>>("/proposal-system", body, {
        params: campaignId
            ? {
                campaignId,
            }
            : undefined,
    });
};

export const patchProposalOption = async (
    campaignId: string,
    optionIndex: number,
    body: CampaignPatchBody,
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
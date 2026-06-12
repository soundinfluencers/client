
import type {
    ApiResponse,
    GetCampaignParams,
    ProposalCampaignDto,
    RegularCampaignDto,
    CampaignPatchBody,
} from "../model/campaign-api.types";
import api from "@/api/api.ts";

export const getCampaign = async (
    campaignId: string,
    params?: GetCampaignParams,
) => {
    return api.get<ApiResponse<RegularCampaignDto | ProposalCampaignDto>>(
        `/campaigns/${campaignId}`,
        {
            params,
        },
    );
};

export const getRegularCampaign = async (campaignId: string) => {
    return api.get<ApiResponse<RegularCampaignDto>>(`/campaigns/${campaignId}`);
};

export const getProposalCampaignOption = async (
    campaignId: string,
    optionIndex: number,
) => {
    return api.get<ApiResponse<ProposalCampaignDto>>(`/proposal-system/${campaignId}`, {
        params: {
            optionIndex,
        },
    });
};

export const patchCampaign = async (
    campaignId: string,
    body: CampaignPatchBody,
) => {
    return api.patch<ApiResponse<RegularCampaignDto>>(
        `/campaigns/${campaignId}`,
        body,
    );
};
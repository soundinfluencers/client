import $api from "../../api.ts";
import type {
  AddProposalOptionRequest,
  ApiResponse,
  CreateRegularCampaignRequest,
  CreateProposalOptionResponse,
  ProposalCampaignDto,
  RegularCampaignDto,
} from "@/entities/client-side/campaign/model/campaign-api.types.ts";
import {
  parseCreateProposalOptionResponse,
} from "@/entities/client-side/campaign/model/proposal-option-response.ts";

// CAMPAIGN

export type ApproveProposalCampaignBody = {
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  referenceNumber: string;
  amount?: never;
  company?: string;
  vatNumber?: string;
  poNumber?: string;
  selectedPaymentMethod: string;
};

export const approveProposalCampaign = async (
    campaignId: string,
    optionIndex: number,
    body: ApproveProposalCampaignBody,
) => {
  return $api.post<unknown>(`/proposal-system/approve/${campaignId}`, body, {
    params: { optionIndex },
  });
};

export const getCampaigns = async (
    status: string,
    page: number = 1,
    limit: number = 12,
): Promise<any[]> => {
  const params = new URLSearchParams();

  if (status !== "all") {
    params.set("status", status);
  }

  params.set("limit", String(limit));
  params.set("page", String(page));

  const result = await $api.get(`/campaigns?${params.toString()}`);
  return result.data.data.campaigns;
};

export const getCampaign = async (
    campaignId: string,
): Promise<ApiResponse<RegularCampaignDto>> => {
  try {
    const res = await $api.get<ApiResponse<RegularCampaignDto>>(
        `/campaigns/${campaignId}`,
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export async function patchCampaignVisibility(
    campaignId: string,
    body: {
      isCpmAndResultHidden: boolean;
      isPriceHidden: boolean;
    },
) {
  return $api.patch(`/campaigns/${campaignId}/update`, body);
}

export type PatchCampaignBody = Partial<{
  campaignName: string;
  addedAccounts: any[];
  campaignContent: any[];

  isCpmAndResultHidden: boolean;
  isPriceHidden: boolean;
}>;

export async function patchCampaign(
    campaignId: string,
    body: PatchCampaignBody,
) {
  return $api.patch(`/campaigns/${campaignId}/update`, body);
}

export const postCampaign = async (
    payload: CreateRegularCampaignRequest,
): Promise<void> => {
  try {
    await $api.post("/campaigns", payload);
  } catch (error) {
    throw error;
  }
};

export const postCampaignRequest = async (
    campaignId: string,
    textaretValue: string,
) => {
  try {
    await $api.post(`/campaigns/${campaignId}/request-edit`, {
      message: textaretValue,
    });
  } catch (error) {
    throw error;
  }
};

// PROPOSAL

export async function getProposalCampaign(
    campaignId: string,
    optionIndex: number,
) {
  const data = await $api.get<ApiResponse<ProposalCampaignDto>>(
    `/proposal-system/${campaignId}`,
    {
      params: { optionIndex },
    },
  );

  return data;
}

export async function patchAddProposalOption(
    campaignId: string,
    optionIndex: number,
    body: {
      campaignName: string;
      addedAccounts: any[];
      campaignContent: any[];
    },
) {
  return $api.patch(`/proposal-system/${campaignId}`, body, {
    params: { optionIndex },
  });
}

export async function postAddProposalOption(
    campaignId: string,
    body: AddProposalOptionRequest,
) {
  const response = await $api.post<CreateProposalOptionResponse>(`/proposal-system`, body, {
    params: { campaignId },
  });

  return parseCreateProposalOptionResponse(response.data);
}

export const postCampaignProposal = async (payload: any) => {
  try {
    const response = await $api.post<CreateProposalOptionResponse>(
      "/proposal-system",
      payload,
    );
    return parseCreateProposalOptionResponse(response.data);
  } catch (error) {
    throw error;
  }
};

export const deleteProposalOption = async (
    campaignId: string,
    optionIndex: number,
) => {
  await $api.delete(`/proposal-system/${campaignId}`, {
    params: { optionIndex },
  });
};

export const getShareLink = async (campaignId: string): Promise<any> => {
  const res = await $api.get(`/campaigns/${campaignId}/share`);
  return res.data;
};

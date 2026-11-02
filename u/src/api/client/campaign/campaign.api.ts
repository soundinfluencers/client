import type { CreateCampaignProposalRequest } from "@/entities/client-side/campaign-strategy-page/api/save-proposal";
import $api from "../../api.ts";
import type { CreateRegularCampaignRequest } from "./create-campaign.types";

// CAMPAIGN

export type ApproveProposalCampaignBody = {
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  referenceNumber: string;
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
  // DTO allowlist: price and saved composition belong to the server.
  const payment = {
    firstName: body.firstName, lastName: body.lastName, address: body.address, country: body.country,
    referenceNumber: body.referenceNumber, selectedPaymentMethod: body.selectedPaymentMethod,
    ...(body.company !== undefined ? { company: body.company } : {}),
    ...(body.vatNumber !== undefined ? { vatNumber: body.vatNumber } : {}),
    ...(body.poNumber !== undefined ? { poNumber: body.poNumber } : {}),
  };
  return $api.post(`/proposal-system/approve/${campaignId}`, payment, {
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

export const getCampaign = async (campaignId: string) => {
  try {
    const res = await $api.get(`/campaigns/${campaignId}`);
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

export const postCampaign = async (payload: CreateRegularCampaignRequest) => {
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
  const data = await $api.get(`/proposal-system/${campaignId}`, {
    params: { optionIndex },
  });

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
    body: CreateCampaignProposalRequest,
) {
  return $api.post(`/proposal-system`, body, {
    params: { campaignId },
  });
}

export const postCampaignProposal = async (payload: any) => {
  try {
    const response = await $api.post("/proposal-system", payload);
    return response;
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

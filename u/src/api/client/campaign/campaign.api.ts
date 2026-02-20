import $api from "../../api.ts";

// CAMPAIGN

export const getCampaigns = async (
  status: string,
  page: number = 1,
  limit: number = 12,
): Promise<any[]> => {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);

  params.set("limit", String(limit));
  params.set("page", String(page));

  const result = await $api.get(`/campaigns?${params.toString()}`);
  return result.data.data.campaigns;
};

export const getCampaign = async (campaignId: string) => {
  try {
    const res = await $api.get(`/campaigns/${campaignId}`);
    console.log(res, "rereerer!");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export async function patchCampaign(
  campaignId: string,

  body: {
    campaignName: string;
    addedAccounts: any[];
    campaignContent: any[];
  },
) {
  return $api.patch(`/campaigns/${campaignId}/update`, body);
}
export const postCampaign = async (payload: any) => {
  try {
    await $api.post("/campaigns", payload);
  } catch (error) {
    console.log(error, "[POST]: error with post data campaign");
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
    console.log(error, "[POST]: error with post postCampaignRequest");
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
  body: {
    campaignName?: string;
    addedAccounts?: any[];
    campaignContent?: any[];
  },
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
    console.log(error, "[POST-PROPOSAL]: error with post data campaign");
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

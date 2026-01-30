import $api from "../../api.ts";

export const getCampaigns = async (
  status: string,
  page: number = 1,
  limit: number = 12,
): Promise<any[]> => {
  const result = await $api.get(
    `/campaigns?status=${status}&limit=${limit}&page=${page}`,
  );
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

export const postCampaign = async (payload: any) => {
  try {
    await $api.post("/campaigns", payload);
  } catch (error) {
    console.log(error, "[POST]: error with post data campaign");
    throw error;
  }
};

export const postCampaignProposal = async (payload: any) => {
  try {
    await $api.post("/proposal-system", payload);
  } catch (error) {
    console.log(error, "[POST-PROPOSAL]: error with post data campaign");
    throw error;
  }
};

export const getShareLink = async (campaignId: string): Promise<any> => {
  const res = await $api.get(`/campaigns/${campaignId}/share`);
  return res.data;
};

import $api from "@/api/api";

export const getCampaign = async (campaignId: string) => {
  try {
    const res = await $api.get(`/campaigns/${campaignId}`);
    console.log(res, "res");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

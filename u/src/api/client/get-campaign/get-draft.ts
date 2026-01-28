import $api from "@/api/api";

export const getCampaignDraft = async (draftId: string) => {
  try {
    const res = await $api.get(`/campaigns/draft/${draftId}`);
    console.log(res, "res-draft");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

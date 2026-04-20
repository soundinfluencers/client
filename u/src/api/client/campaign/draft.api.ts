import $api from "@/api/api";

export const getCampaignDraft = async (draftId: string) => {
  try {
    const res = await $api.get(`/campaigns/draft/${draftId}`);
    return res.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const postCampaignDraft = async (payload: any) => {
  try {
    await $api.post("/campaigns/draft", payload);
  } catch (error) {

    throw error;
  }
};

export const deleteDraft = (draftId: string) =>
  $api.delete(`/campaigns/draft/${draftId}`);

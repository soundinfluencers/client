import $api from "@/api/api";

export const getCampaignDraft = async (draftId: string) => {
  try {
    const res = await $api.get(`/campaigns/draft/${draftId}`);
    console.log(res, "res");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const postCampaignDraft = async (payload: any) => {
  try {
    await $api.post("/campaigns/draft", payload);
  } catch (error) {
    console.log(error, "[POST-DRAFT]: error with post data campaign");
    throw error;
  }
};

export const deleteDraft = (draftId: string) =>
  $api.delete(`/campaigns/draft/${draftId}`);

import $api from "@/api/api";

export const postCampaignDraft = async (payload: any) => {
  try {
    console.log(payload, "sent paylodad");
    await $api.post("/campaigns/draft", payload);
  } catch (error) {
    console.log(error, "[POST-DRAFT]: error with post data campaign");
    throw error;
  }
};

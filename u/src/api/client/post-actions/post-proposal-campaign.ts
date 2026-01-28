import $api from "@/api/api";

export const postCampaignProposal = async (payload: any) => {
  try {
    await $api.post("/proposal-system", payload);
    console.log(payload, "sent paylodad");
  } catch (error) {
    console.log(error, "[POST-PROPOSAL]: error with post data campaign");
    throw error;
  }
};

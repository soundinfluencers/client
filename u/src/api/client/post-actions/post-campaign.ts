import $api from "@/api/api";

export const postCampaign = async (payload: any) => {
  try {
    console.log(payload, "sent paylodad");
    await $api.post("/campaigns", payload);
  } catch (error) {
    console.log(error, "[POST]: error with post data campaign");
    throw error;
  }
};

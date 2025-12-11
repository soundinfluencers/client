import $api from "../../api.ts";

// get camapigns client //

export const getCampaigns = async (): Promise<any[]> => {
  try {
    const result = await $api.get(`/promos/client/get/list`);
    console.log("Success:", result.data);
    return result.data.campaigns;
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    console.error("Response status:", error.response?.status);
    console.error("Response data:", error.response?.data);
    throw error;
  }
};

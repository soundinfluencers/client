import $api from "../../api";

// get influencer promos //

export const getInfluencerPromos = async (): Promise<any[]> => {
  try {
    const result = await $api.get(`/promos`);
    console.log("Success:", result.data);
    return result.data.promos;
  } catch (error: any) {
    console.error("Error fetching influencer promos:", error);
    console.error("Response status:", error.response?.status);
    console.error("Response data:", error.response?.data);
    throw error;
  }
};
import type { Campaign } from "@/pages/influencer/dashboard-layout/components/campaign-history-list/types/campaign-history.types";
import $api from "../../api";

export const getCampaignHistory = async (page: number, limit: number): Promise<Campaign[]> => {
  try {
    const response = await $api.get(
      `/influencer-actions-history/me?limit=${limit}&page=${page}`
    );
    console.log("history fetched:", response.data);

    return response.data.data.history as Campaign[];
  } catch (error) {
    console.error("Error fetching campaign history:", error);
    throw error;
  }
};

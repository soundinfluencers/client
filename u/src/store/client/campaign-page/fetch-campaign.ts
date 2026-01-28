import { getCampaign } from "@/api/client/get-campaign/get-campaign";
import { getCampaignDraft } from "@/api/client/get-campaign/get-draft";
import type { CampaignFetchState } from "@/types/store/index.types";
import { create } from "zustand";

export const useFetchCampaign = create<CampaignFetchState>((set) => ({
  campaign: null,
  draft: null,
  status: null,
  setDraft: async (draftId) => {
    try {
      const { data } = await getCampaignDraft(draftId);
      set({ campaign: data });
    } catch (error) {
      console.log(error);
    }
  },
  setCampaign: async (campaignId) => {
    try {
      const { data } = await getCampaign(campaignId);

      set({ campaign: data, status: data.status });
    } catch (error) {
      console.log(error);
    }
  },
}));

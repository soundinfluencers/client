import { create } from "zustand";
import { getMultiPromoAccounts } from "../../api/client/CreatorCampaign/multi-promo-accounts/client-creator-campaign-promos.api";
import type { PromoCard } from "../../types/creator-campaign/creator-campaign.types";

interface CreateCampaignProps {
  promosCards: PromoCard[];
  setPromoCards: (socialMedia: string) => void;
}

export const useCreateCampaign = create<CreateCampaignProps>((set, get) => ({
  promosCards: [],

  setPromoCards: async (socialMedia: string) => {
    try {
      const { data } = await getMultiPromoAccounts(socialMedia);
      set({ promosCards: data.accounts });
    } catch (error) {
      throw error;
    }
  },
}));

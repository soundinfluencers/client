import { create } from "zustand";
import { getMultiPromoAccounts } from "@/api/client/CreatorCampaign/multi-promo-accounts/client-creator-campaign-promos.api";
import { getPublishedOffers } from "@/api/client/CreatorCampaign/offers/client-creator-campaign-offers.api";
import type {
  CreateCampaignPlatformProps,
  CreateCampaignProps,
} from "@/types/store/index.types";
import type { FilterItem } from "@/types/client/creator-campaign/filters.types";

export const useCreateCampaign = create<CreateCampaignProps>((set, get) => ({
  promosCards: [],
  offers: [],
  loading: false,

  setPromoCards: (promoCards) => {
    set({ promosCards: promoCards });
  },

  setOffers: async (platform: string, genre: string) => {
    try {
      set({ loading: true });

      // ⬇️ ДАЁМ БРАУЗЕРУ ОТРИСОВАТЬ LOADER
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const data = await getPublishedOffers(platform, genre);

      set({ offers: data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  getMatchedAccountIds: (offer) => {
    if (!offer) return new Set();

    const cards = get().promosCards;
    const idsCards = new Set(cards.map((c) => c.influencerId));

    return new Set(
      offer.connectedAccounts
        .filter((acc) => idsCards.has(acc.accountId))
        .map((acc) => acc.accountId)
    );
  },
}));

export const useCreateCampaignPlatform = create<CreateCampaignPlatformProps>(
  (set) => ({
    selectedPlatform: "instagram",
    setPlatform: (platform: string) => {
      set({ selectedPlatform: platform });
    },
  })
);

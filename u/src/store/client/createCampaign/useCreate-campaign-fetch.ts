import { create } from "zustand";
import type {
  IApiOffer,
  IPromoCard,
} from "@/types/client/creator-campaign/creator-campaign.types";
import { getPublishedOffers } from "@/api/client/CreatorCampaign/offers/client-creator-campaign-offers.api";
import type { SocialMediaType } from "@/types/utils/constants.types";

type CreateCampaignState = {
  promosCards: IPromoCard[];
  offers: IApiOffer[];
  loading: boolean;
  offersRequestId: number;

  setPromoCards: (promoCards: IPromoCard[]) => void;
  setOffers: (platform: SocialMediaType, genre: string) => Promise<void>;

  getMatchedAccountIds: (offer: IApiOffer | null) => Set<string>;
  getPromoCardsFromOffer: (offer: IApiOffer | null) => IPromoCard[];
};

export const useCreateCampaign = create<CreateCampaignState>((set, get) => ({
  promosCards: [],
  offers: [],
  loading: false,
  offersRequestId: 0,

  setPromoCards: (promoCards) => {
    if (get().promosCards === promoCards) return;
    set({ promosCards: promoCards });
  },

  setOffers: async (platform, genre) => {
    const requestId = Date.now();
    set({ loading: true, offersRequestId: requestId });

    try {
      const data = await getPublishedOffers(platform, genre);

      if (get().offersRequestId !== requestId) return;

      set({ offers: data, loading: false });
    } catch {
      if (get().offersRequestId !== requestId) return;
      set({ loading: false });
    }
  },

  getPromoCardsFromOffer: (offer) => {
    if (!offer) return [];
    const promosCards = get().promosCards;
    const offerIds = new Set(
      offer.connectedAccounts.map((acc) => acc.accountId),
    );
    return promosCards.filter((card) => offerIds.has(card.accountId));
  },

  getMatchedAccountIds: (offer) => {
    if (!offer) return new Set();

    const idsCards = new Set(get().promosCards.map((c) => c.accountId));
    return new Set(
      offer.connectedAccounts
        .filter((acc) => idsCards.has(acc.accountId))
        .map((acc) => acc.accountId),
    );
  },
}));

import { create } from "zustand";
import type { CreateCampaignFetchState } from "./types";

export const useCreateCampaign = create<CreateCampaignFetchState>((set, get) => ({
  promosCards: [],
  offers: [],
  pending: {
    offers: false,
    promoCards: false,
  },
  loading: false,

  setPending: (key, value) => {
    set((state) => {
      const pending = { ...state.pending, [key]: value };
      return {
        pending,
        loading: Object.values(pending).some(Boolean),
      };
    });
  },

  setOffersData: (offers) => set({ offers }),
  setPromoCards: (promoCards) => set({ promosCards: promoCards }),

  getPromoCardsFromOffer: (offer) => {
    if (!offer) return [];
    const promosCards = get().promosCards;
    const offerIds = new Set(offer.connectedAccounts.map((acc) => acc.accountId));
    return promosCards.filter((card) => offerIds.has(card.accountId));
  },

  getMatchedAccountIds: (offer) => {
    if (!offer) return new Set();

    const idsCards = new Set(get().promosCards.map((card) => card.accountId));
    return new Set(
        offer.connectedAccounts
            .filter((acc) => idsCards.has(acc.accountId))
            .map((acc) => acc.accountId),
    );
  },
}));
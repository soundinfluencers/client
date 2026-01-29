import { create } from "zustand";
import type {
  IApiOffer,
  IPromoCard,
} from "@/types/client/creator-campaign/creator-campaign.types";

type PendingKey = "offers" | "promoCards";

type CreateCampaignState = {
  promosCards: IPromoCard[];
  offers: IApiOffer[];

  pending: Record<PendingKey, boolean>;

  loading: boolean;

  setPending: (key: PendingKey, v: boolean) => void;
  setOffersData: (offers: IApiOffer[]) => void;
  setPromoCards: (promoCards: IPromoCard[]) => void;

  getMatchedAccountIds: (offer: IApiOffer | null) => Set<string>;
  getPromoCardsFromOffer: (offer: IApiOffer | null) => IPromoCard[];
};

export const useCreateCampaign = create<CreateCampaignState>((set, get) => ({
  promosCards: [],
  offers: [],

  pending: {
    offers: false,
    promoCards: false,
  },

  loading: false,

  setPending: (key, v) => {
    set((state) => {
      const pending = { ...state.pending, [key]: v };
      const loading = Object.values(pending).some(Boolean);
      return { pending, loading };
    });
  },

  setOffersData: (offers) => set({ offers }),
  setPromoCards: (promoCards) => set({ promosCards: promoCards }),

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

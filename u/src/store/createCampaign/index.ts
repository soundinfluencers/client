import { create } from "zustand";
import { getMultiPromoAccounts } from "../../api/client/CreatorCampaign/multi-promo-accounts/client-creator-campaign-promos.api";
import type {
  IApiOffer,
  IPromoCard,
} from "../../types/creator-campaign/creator-campaign.types";
import { getPublishedOffers } from "../../api/client/CreatorCampaign/offers/client-creator-campaign-offers.api";
import { calcTotal } from "../../utils/functions/calsTotal";

// data using on(CreateCampaign-Page) //

interface CreateCampaignProps {
  offers: IApiOffer[];
  promosCards: IPromoCard[];
  loading: boolean;
  setOffers: (platform: string, genre: string) => void;
  setPromoCards: (socialMedia: string) => void;
}

export const useCreateCampaign = create<CreateCampaignProps>((set) => ({
  promosCards: [],
  offers: [],
  loading: false,
  setPromoCards: async (socialMedia: string) => {
    try {
      set({ loading: true });
      const { data } = await getMultiPromoAccounts(socialMedia);
      set({ promosCards: data.accounts, loading: false });
    } catch (error) {
      throw error;
    }
  },
  setOffers: async (platform: string, genre: string) => {
    try {
      set({ loading: true });
      const data = await getPublishedOffers(platform, genre);
      set({ offers: data, loading: false });
    } catch (error) {}
  },
}));

// data using on(Content-page) //

interface FormDataOffer {
  activeOfferId: string | null;
  setActiveOffer: (id: string) => void;
  offer: IApiOffer | null;
  setOffer: (data: IApiOffer) => void;
  promoCard: IPromoCard[];
  setPromoCard: (data: IPromoCard) => void;
  totalPrice: number;
  recalcTotal: () => void;
}

export const useFormDataOffer = create<FormDataOffer>((set, get) => ({
  offer: null,
  promoCard: [],
  totalPrice: 0,
  activeOfferId: null,

  setPromoCard: (data) =>
    set((state) => {
      const updatedCards = [...state.promoCard, data];

      return {
        promoCard: updatedCards,
        totalPrice: calcTotal(state.offer, updatedCards),
      };
    }),

  setOffer: (data) =>
    set((state) => ({
      offer: data,
      totalPrice: calcTotal(data, state.promoCard),
    })),

  setActiveOffer: (id) => set({ activeOfferId: id }),

  recalcTotal: () => {
    const state = get();
    set({
      totalPrice: calcTotal(state.offer, state.promoCard),
    });
  },
}));

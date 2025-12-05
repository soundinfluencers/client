import { create } from "zustand";
import { getMultiPromoAccounts } from "../../api/client/CreatorCampaign/multi-promo-accounts/client-creator-campaign-promos.api";
import type {
  ApiOffer,
  PromoCard,
} from "../../types/creator-campaign/creator-campaign.types";
import { getPublishedOffers } from "../../api/client/CreatorCampaign/offers/client-creator-campaign-offers.api";

interface CreateCampaignProps {
  offers: ApiOffer[];
  promosCards: PromoCard[];
  loading: boolean;
  setOffers: (platform: string, genre: string) => void;
  setPromoCards: (socialMedia: string) => void;
}

export const useCreateCampaign = create<CreateCampaignProps>((set, get) => ({
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

interface FormDataOffer {
  activeOfferId: string | null;
  setActiveOffer: (id: string) => void;
  offer: ApiOffer | null;
  setOffer: (data: ApiOffer) => void;
}

export const useFormDataOffer = create<FormDataOffer>((set) => ({
  offer: null,
  activeOfferId: null,
  setOffer: (data: ApiOffer) => set({ offer: data }),
  setActiveOffer: (id: string) => set({ activeOfferId: id }),
}));

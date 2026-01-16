import type {
  IApiOffer,
  IPromoCard,
} from "../client/creator-campaign/creator-campaign.types";
import type { FilterItem } from "../client/creator-campaign/filters.types";
import type { Profile } from "../profile-details/profile-detials.types";

// profile-details

export interface IProfileDetails {
  profile: Profile | null;
  setProfile: (data: Profile) => void;
}

// account-settings

export interface AccountSettingsEdit {
  isEdit: boolean;
  onChangeEdit: () => void;

  isConfirm: boolean;
  setConfirm: () => void;

  isEmail: boolean;
  onChangeEmail: () => void;

  resetAll: () => void;
}

// filters

export interface FilterCampaign {
  selected: FilterItem[];
  setSelected: (items: FilterItem[]) => void;
  toggleItem: (
    item: FilterItem,
    checked: boolean,
    filters: FilterItem[]
  ) => void;
  removeItem: (id: string) => void;
}

// create campaign

export interface CreateCampaignProps {
  offers: IApiOffer[];
  promosCards: IPromoCard[];
  loading: boolean;
  setOffers: (platform: string, genre: string) => void;
  setPromoCards: (promoCards: IPromoCard[]) => void;

  getMatchedAccountIds: (offer: IApiOffer | null) => Set<string>;
}

export interface CreateCampaignPlatformProps {
  selectedPlatform: string;
  setPlatform: (platform: string) => void;
}

// useCampaign

type PlatformForm = {
  _id: string;
  videoLink?: string;
  postDescriptions?: string[];
  storyTag?: string;
  swipeUpLink?: string;
  specialWishes?: string;
  socialMedia?: string; // tiktok, instagram, spotify
};
export type CampaignState = {
  offer: IApiOffer | null;
  promoCard: IPromoCard[];
  campaignName?: string;
  campaignPayload: any | null;
  postContent: {
    main: Array<PlatformForm>; // tiktok, instagram, youtube, facebook
    music: Array<PlatformForm>; // spotify, soundcloud
    press: Array<PlatformForm>;
  };

  totalPrice: number;
  activeOfferId: string | null;

  actions: {
    setOffer: (offer: IApiOffer) => void;
    setPromoCard: (card: IPromoCard) => void;
    addPostContent: (
      group: "main" | "music" | "press",
      formData: Record<string, string>,
      socialMedia: string
    ) => void;
    setActiveOffer: (id: string) => void;
    setCampaignName: (campaignName: string) => void;
    prepareCampaignPayload: (
      formData: Record<string, string>,
      selectedPlatforms: string[],
      grouped: Record<"main" | "music" | "press", string[]>,
      campaignName?: string,
      campaignPrice?: number
    ) => void;
    resetCampaign: () => void;
    recalcTotal: () => void;
  };
};

import type {
  IApiOffer,
  ICampaignAccount,
  IPromoCard,
} from "../client/creator-campaign/creator-campaign.types";
import type { FilterItem } from "../client/creator-campaign/filters.types";
import type { Profile } from "../client/profile-details/profile-detials.types";
import type { SocialMediaType } from "../utils/constants.types";

//
// =========================
// profile-details
// =========================
//

export interface IProfileDetails {
  profile: Profile | null;
  setProfile: (data: Profile) => void;
}

//
// =========================
// account-settings
// =========================
//

export interface AccountSettingsEdit {
  isEdit: boolean;
  onChangeEdit: () => void;

  isConfirm: boolean;
  setConfirm: () => void;

  isEmail: boolean;
  onChangeEmail: () => void;

  resetAll: () => void;
}

//
// =========================
// filters
// =========================
//

export interface FilterCampaign {
  selected: FilterItem[];
  setSelected: (
    itemsOrUpdater: FilterItem[] | ((prev: FilterItem[]) => FilterItem[]),
  ) => void;

  toggleItem: (
    item: FilterItem,
    checked: boolean,
    filters: FilterItem[],
  ) => void;

  removeItem: (id: string) => void;
}

//
// =========================
// create campaign
// =========================
//

export interface CreateCampaignProps {
  offers: IApiOffer[];
  promosCards: IPromoCard[];
  loading: boolean;

  setOffers: (platform: string, genre: string) => void;
  setPromoCards: (promoCards: IPromoCard[]) => void;

  getMatchedAccountIds: (offer: IApiOffer | null) => Set<string>;

  getPromoCardsFromOffer: (offer: any) => IPromoCard[];
}

export interface CreateCampaignPlatformProps {
  selectedPlatform: SocialMediaType;
  setPlatform: (platform: SocialMediaType) => void;
}

export interface CreateCampaignCountriesProps {
  selectedCountries: string[];
  setCountries: (country: string) => void;
}

//
// =========================
// useCampaign (create campaign local state)
// =========================
//

type PlatformForm = {
  _id: string;
  videoLink?: string;
  postDescriptions?: string[];
  storyTag?: string;
  swipeUpLink?: string;
  specialWishes?: string;
  socialMedia?: string;
};

// =========================
// campaign-page-fetch (API campaign details) — FIXED TYPES
// =========================
export type CampaignState = {
  offer: IApiOffer | null;
  promoCard: IPromoCard[];
  selectedAccounts: ICampaignAccount[];
  campaignName?: string;

  campaignContent: any[];

  campaignPayload: any | null;

  postContentDraft: Record<string, string> | null;

  postContent: {
    main: Array<PlatformForm>;
    music: Array<PlatformForm>;
    press: Array<PlatformForm>;
  };

  totalPrice: number;
  activeOfferId: string | null;

  actions: {
    getDraftPayload: () => any;
    getProposalPayload: () => void;
    setOffer: (offer: IApiOffer) => void;
    setPromoCards: (cards: IPromoCard | IPromoCard[]) => void;
    setCampaignAccount: (data: ICampaignAccount) => void;
    addPostContent: (
      group: "main" | "music" | "press",
      formData: Record<string, string>,
      socialMedia: string,
    ) => void;
    setPostContentDraft: (v: Record<string, string>) => void;
    clearPostContentDraft: () => void;
    setActiveOffer: (id: string) => void;
    setCampaignName: (campaignName: string) => void;

    // ✅ SSOT build step (один раз на PostContent)
    buildCampaignContentFromForm: (
      formData: Record<string, any>,
      selectedPlatforms: string[],
      grouped: Record<"main" | "music" | "press", string[]>,
    ) => void;

    // ✅ derived payload (всегда корректный)
    getCampaignPayload: (paymentMethod: string) => any;

    resetCampaign: () => void;
  };
};

export type ObjectId = string;
export type ISODateString = string;

export type CampaignBackendStatus =
  | "work"
  | "pending"
  | "distributing"
  | "completed"
  | string;

export type SocialMedia =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "spotify"
  | "soundcloud"
  | string;

export type ConfirmationStatus = "accept" | "wait" | "reject" | string;
export type ClosePromo = "close" | "open" | "wait" | string;

/**
 * У тебя сейчас dateRequest приходит как строка: "ASAP" | "BEFORE ..." | ...
 * Поэтому просто string (можно расширить позже).
 */
export type DateRequest = string;

export type SocialMediaGroup = "main" | "music" | "press" | string;

// -------------------------
// campaignContent (контент кампании)
// -------------------------

export interface CampaignContentDescription {
  _id: ObjectId;
  description: string;
}

export interface CampaignContentItem {
  _id: ObjectId;

  socialMedia: SocialMedia;
  socialMediaGroup: SocialMediaGroup;

  /** В JSON это mainLink */
  mainLink: string;

  /** В JSON это descriptions: [{_id, description}] */
  descriptions: CampaignContentDescription[];

  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
}

// -------------------------
// addedAccounts (строки таблицы)
// -------------------------

export interface SelectedContentRef {
  campaignContentItemId: ObjectId;
  descriptionId: ObjectId;
}

/**
 * В JSON внутри addedAccounts есть selectedCampaignContentItem
 * и он выглядит почти как CampaignContentItem, но с одним description string.
 */
export interface SelectedCampaignContentItemSnapshot {
  _id: ObjectId;
  mainLink: string;

  description: string; // строкой (не массив)
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
}

export interface CampaignAddedAccount {
  _id: ObjectId;

  influencerId: ObjectId;
  socialAccountId: ObjectId;
  addedAccountsId: ObjectId;
  socialMedia: SocialMedia;

  /** В JSON это username */
  username: string;

  /** В JSON это number */
  price: number;
  publicPrice: number;

  followers: number;

  confirmation: ConfirmationStatus;
  closePromo: ClosePromo;

  selectedContent: SelectedContentRef;

  dateRequest: DateRequest;

  postLink: string;
  screenshot: string;

  impressions: number | null;

  /** В JSON поле называется like */
  like: number | null;

  comments: number | null;
  shares: number | null;
  saves: number | null;

  rating: number | null;
  adminChecked: boolean;

  createdAt: ISODateString;
  updatedAt: ISODateString;

  /** В JSON есть selectedCampaignContentItem (snapshot) */
  selectedCampaignContentItem?: SelectedCampaignContentItemSnapshot;
}

// -------------------------
// CampaignResponse
// -------------------------

export interface CampaignResponse {
  campaignId: ObjectId;
  campaignName: string;
  canEdit: boolean;
  socialMedia: SocialMedia;

  /** В JSON "09.01.26" — это НЕ ISO. Поэтому string. */
  creationDate: string;

  price: number;

  status: CampaignBackendStatus;

  addedAccounts: CampaignAddedAccount[];
  campaignContent: CampaignContentItem[];

  cpm: number;

  shareLink: string;

  totalFollowers: number;
  totalImpressions: number;
  totalLikes: number;
  totalSaves: number;
  totalComments: number;
  totalShares: number;

  isCpmAndResultHidden: boolean;
  isPriceHidden: boolean;

  hiddenColumns: string[];
}

// -------------------------
// UI state (если нужен)
// -------------------------

export type CampaignStatusUI =
  | "distributing"
  | "completed"
  | "pending"
  | "under_review"
  | "proposal";

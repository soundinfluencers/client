import type { CampaignDraftLatestStep } from "@/client-side/types/draft.types";

import type { FilterItem } from "@/types/client/creator-campaign/filters.types";
import type {CampaignContentItem} from "@/client-side/types/content.ts";
import type {SocialMedia} from "@/client-side/types/common.ts";
import type {ConnectedAccount, Offer} from "@/client-side/types/offers.ts";


export type CampaignPostContentGroup = "main" | "music" | "press";

export type SortFilterOption = {
    key: string;
    name: string;
};

export type CurrencyOption = {
    key: string;
    currency: string;
};

export type PendingKey = "offers" | "promoCards";

export type DraftPayloadOverrides = {
    campaignName?: string;
    draftId?: string | null;
    campaignContent?: CampaignContentItem[];
};

export type PlatformForm = {
    _id: string;
    videoLink?: string;
    postDescriptions?: string[];
    storyTag?: string;
    swipeUpLink?: string;
    specialWishes?: string;
    socialMedia?: string;
};

export interface BuildCampaignFiltersState {
    filterMethod: string;
    selectedFilter: SortFilterOption;
    selectedCurrency: CurrencyOption;
    selectedBudget: number;
    setFilterMethod: (method: string) => void;
    setFilter: (filter: SortFilterOption) => void;
    setCurrency: (currency: CurrencyOption) => void;
    setBudget: (budget: number) => void;
    reset: () => void;
}

export interface CreateCampaignPlatformState {
    selectedPlatform: SocialMedia;
    setPlatform: (platform: SocialMedia) => void;
}

export interface CreateCampaignFetchState {
    promosCards: ConnectedAccount[];
    offers: Offer[];
    pending: Record<PendingKey, boolean>;
    loading: boolean;
    setPending: (key: PendingKey, value: boolean) => void;
    setOffersData: (offers: Offer[]) => void;
    setPromoCards: (promoCards: ConnectedAccount[]) => void;
    getMatchedAccountIds: (offer: Offer | null) => Set<string>;
    getPromoCardsFromOffer: (offer: Offer | null) => ConnectedAccount[];
}

export interface FilterCampaignState {
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
    reset: () => void;
}

export interface CampaignStoreState {
    offer: Offer | null;
    promoCard: ConnectedAccount[];
    promoCardUI: ConnectedAccount[];
    selectedAccounts: ICampaignAccount[];
    campaignName: string;
    campaignContent: CampaignContentItem[];
    campaignPayload: unknown | null;
    postContentDraft: Record<string, string> | null;

    postContent: {
        main: PlatformForm[];
        music: PlatformForm[];
        press: PlatformForm[];
    };
    totalPrice: number;
    activeOfferId: string | null;
    draftId: string | null;
    draftStep: CampaignDraftLatestStep | null;
    actions: CampaignStoreActions;
}

export interface CampaignStoreActions {
    setPostContentDraft: (value: Record<string, string> | null) => void;
    clearPostContentDraft: () => void;
    clearPostContentAll: () => void;
    setSelectedCampaignContentItem: (
             accountId: string,
             selectedCampaignContentItem: {
                 campaignContentItemId: string;
                 descriptionId: string;
             }) => void;
    buildCampaignContentAndSyncAccounts: (
        formData: Record<string, any>,
        selectedPlatforms: string[],
        grouped: Record<"main" | "music" | "press", string[]>,
    ) => void;
    setOffer: (offer: Offer | null) => void;
    setActiveOffer: (id: string | null) => void;

    setPromoCards: (cards: ConnectedAccount | ConnectedAccount[]) => void;
    setPromoCardsUI: (cards: ConnectedAccount | ConnectedAccount[]) => void;
    setCampaignAccount: (account: ICampaignAccount) => void;

    addPostContent: (
        group: CampaignPostContentGroup,
        formData: Record<string, string>,
        socialMedia: string,
    ) => void;

    setCampaignName: (campaignName: string) => void;

    buildCampaignContentFromForm: (
        formData: Record<string, string>,
        selectedPlatforms: string[],
        grouped: Record<CampaignPostContentGroup, string[]>,
    ) => void;

    getCampaignPayload: (paymentMethod: string) => unknown;
    getDraftPayload: (
        step: CampaignDraftLatestStep,
        overrides?: DraftPayloadOverrides,
    ) => unknown;
    getProposalPayload: () => unknown;

    setDraftId: (draftId: string | null) => void;
    setDraftStep: (draftStep: CampaignDraftLatestStep | null) => void;

    resetCampaign: () => void;
}



export interface ICampaignAccount extends Pick<
    ConnectedAccount,
    "accountId" | "influencerId" | "socialMedia" | "username"
> {
    selectedCampaignContentItem: {
        campaignContentItemId: string;
        descriptionId: string;
    };
    dateRequest: string;
}
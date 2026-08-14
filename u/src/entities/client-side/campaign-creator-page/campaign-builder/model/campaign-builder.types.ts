import type { CampaignPostContentBlock } from "@/widgets/client-side/campaign-post-content/model/campaign-post-content.types";
import type { Bundle } from "@/entities/client-side/campaign-creator-page/bundle";
import type { CampaignCurrencyCode } from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";
import type {
    CampaignDraftAccountSocialMedia,
    CampaignDraftSource,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";

// @ts-ignore
export enum CampaignDraftLatestStep {
    addAccounts = "addAccounts",
    addContent = "addContent",
    strategyTable = "strategyTable",
}

export type SelectedCampaignContentRef = {
    campaignContentItemId: string;
    descriptionId: string;
};

export type SelectedCampaignAccount = {
    accountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    logoUrl?: string;
    followers?: number;
    price?: number;
    prices?: Partial<Record<CampaignCurrencyCode, number>>;
    dateRequest?: string;
    selectedCampaignContentItem?: SelectedCampaignContentRef | null;
    profileType?: "creator" | "community";
    source?: "manual" | "offer" | "bundle";
    bundleId?: string;

    genres?: string[];
    countries?: Array<{
        country: string;
        percentage: number;
    }>;
};

export type SelectedBundleSnapshot = Bundle;

export type DraftSelectionRow = {
    selectionId: string;
    source: CampaignDraftSource;
    influencerId: string;
    socialAccountId: string;
    socialMedia: CampaignDraftAccountSocialMedia;
    bundleId?: string;
    offerId?: string;
};

export type CampaignPriceMap = Partial<
    Record<CampaignCurrencyCode, number>
>;

export type CampaignContentDescription = {
    _id: string;
    description: string;
};

export type CampaignContentItem = {
    _id: string;
    socialMedia: string;
    socialMediaGroup: "main" | "music" | "press";
    mainLink: string;
    descriptions: CampaignContentDescription[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
    accountId?: string;
    profileType?: "creator" | "community";
    mediaCache?: any;
};

export type CampaignBuilderState = {
    campaignName: string;
    selectedOfferName: string;
    draftId: string | null;
    draftStep: CampaignDraftLatestStep | null;

    selectedOfferId: string | null;
    selectedOfferPrice: number | undefined;
    selectedOfferPrices: CampaignPriceMap;
    selectionCurrency: CampaignCurrencyCode | null;
    selectedPromoCardIds: string[];
    selectedOfferAccountIds: string[];
    selectedAccounts: SelectedCampaignAccount[];
    selectedOfferAccounts: SelectedCampaignAccount[];
    selectedBundles: SelectedBundleSnapshot[];
    draftSelectionRows: DraftSelectionRow[];

    campaignContent: CampaignContentItem[];
    postContentDraft: Record<string, unknown> | null;
    blocksDraft: CampaignPostContentBlock[] | null;
    totalPrice: number;
    selectedCurrency: string;
};

export type HydratedCampaignBuilderDraftState = Pick<
    CampaignBuilderState,
    | "campaignName"
    | "draftId"
    | "draftStep"
    | "selectedOfferId"
    | "selectedOfferName"
    | "selectedOfferPrice"
    | "selectedOfferPrices"
    | "selectionCurrency"
    | "selectedPromoCardIds"
    | "selectedOfferAccountIds"
    | "selectedAccounts"
    | "selectedOfferAccounts"
    | "selectedBundles"
    | "draftSelectionRows"
    | "campaignContent"
    | "totalPrice"
    | "selectedCurrency"
>;

export type CampaignBuilderActions = {
    setCampaignName: (value: string) => void;
    setDraftMeta: (payload: {
        draftId: string | null;
        draftStep: CampaignDraftLatestStep | null;
    }) => void;

    selectOffer: (payload: {
        offerId: string | null;
        accountIds?: string[];
        accounts?: SelectedCampaignAccount[];
        offerName?: string;
        offerPrice?: number;
        offerPrices?: CampaignPriceMap;
        currency: CampaignCurrencyCode;
    }) => void;
    selectBundle: (
        bundle: Bundle,
        currency: CampaignCurrencyCode,
    ) => void;
    removeBundle: (bundleId: string) => void;

    setSelectedPromoCardIds: (ids: string[]) => void;
    togglePromoCardId: (id: string) => void;
    togglePromoCard: (
        account: SelectedCampaignAccount,
        currency: CampaignCurrencyCode,
    ) => void;
    setSelectedAccounts: (accounts: SelectedCampaignAccount[]) => void;
    upsertSelectedAccount: (account: SelectedCampaignAccount) => void;
    setDraftSelectionRows: (rows: DraftSelectionRow[]) => void;

    setSelectedCampaignContentItem: (
        accountId: string,
        selectedCampaignContentItem: SelectedCampaignContentRef,
    ) => void;

    setAccountDateRequest: (accountId: string, dateRequest: string) => void;

    setCampaignContent: (items: CampaignContentItem[]) => void;
    setPostContentDraft: (value: Record<string, unknown> | null) => void;
    setBlocksDraft: (value: CampaignPostContentBlock[] | null) => void;
    syncSelectedAccountsContent: (
        addedAccounts: Array<{
            socialAccountId: string;
            selectedCampaignContentItem?: {
                campaignContentItemId: string;
                descriptionId: string;
            } | null;
            dateRequest?: string;
            profileType?: "creator" | "community";
        }>,
    ) => void;
    setSelectedCurrency: (currency: string) => void;
    setSelectionCurrency: (currency: CampaignCurrencyCode | null) => void;
    switchCampaignCurrency: (
        currency: CampaignCurrencyCode,
    ) => CampaignCurrencySwitchResult;
    hydrateFromDraft: (payload: HydratedCampaignBuilderDraftState) => void;

    setTotalPrice: (value: number) => void;
    reset: () => void;
};

export type CampaignBuilderStore = CampaignBuilderState & {
    actions: CampaignBuilderActions;
};

export type CampaignCurrencyMissingPrices = {
    offerIds: string[];
    bundleIds: string[];
    accountIds: string[];
    overlapAccountIds: string[];
};

export type CampaignCurrencySwitchResult =
    | { ok: true }
    | {
        ok: false;
        targetCurrency: CampaignCurrencyCode;
        missing: CampaignCurrencyMissingPrices;
    };

import type { Bundle } from "../../bundle/model/bundle.types";
import type { CampaignPostContentBlock } from "@/widgets/client-side/campaign-post-content/model/campaign-post-content.types";
import type { DisplayCurrency, OfferPrices } from "./selected-offer";
import type { ProposalAddSession } from "./proposal-add-influencer-builder";

export { CampaignDraftLatestStep } from "@/client-side/types/draft.types";
import type { CampaignDraftLatestStep } from "@/client-side/types/draft.types";

export type SelectedCampaignContentRef = {
    campaignContentItemId: string;
    descriptionId: string | null;
    additionalBriefId?: string | null;
};

export type SelectedCampaignAccount = {
    isAvailable?: boolean;
    unavailableReason?: string;
    selectionId?: string;
    _id?: string;
    addedAccountsId?: string;
    bundleId?: string;
    accountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    logoUrl?: string;
    followers?: number;
    price?: number;
    priceCurrency?: DisplayCurrency;
    prices?: Partial<OfferPrices>;
    dateRequest?: string;
    selectedCampaignContentItem?: SelectedCampaignContentRef | null;
    profileType?: "creator" | "community";
    source?: "manual" | "offer" | "bundle";

    genres?: string[];
    communityMusicGenres?: string[];
    communityThemeTopics?: string[];
    creatorMusicGenres?: string[];
    creatorContentFocus?: string[];
    countries?: Array<{
        country: string;
        percentage?: number;
    }>;
};

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
    additionalBrief: string | Array<{ _id: string; additionalBrief: string }>;
    accountId?: string;
    profileType?: "creator" | "community";
    mediaCache?: any;
};

export type SelectedBundleSnapshot = Bundle & {
    selectedAccountIds?: string[];
    currentAccountIds?: string[];
    isAvailable?: boolean;
    unavailableReason?: string;
};

export type CampaignBuilderState = {
    proposalAddSession: ProposalAddSession | null;
    selectedBundles: SelectedBundleSnapshot[];
    campaignName: string;
    selectedOfferName: string;
    draftId: string | null;
    draftStep: CampaignDraftLatestStep | null;
    draftRevision: number;

    selectedOfferId: string | null;
    selectedOfferPrice: number | null;
    selectedOfferPrices: Partial<OfferPrices> | null;
    selectedOfferIsAvailable: boolean | null;
    selectedOfferUnavailableReason: string | null;
    offerCatalogContext: { platform: string; genre: string } | null;
    selectedPromoCardIds: string[];
    selectedOfferAccountIds: string[];
    selectedAccounts: SelectedCampaignAccount[];
    selectedOfferAccounts: SelectedCampaignAccount[];

    campaignContent: CampaignContentItem[];
    postContentDraft: Record<string, unknown> | null;
    blocksDraft: CampaignPostContentBlock[] | null;
    totalPrice: number;
    totalPriceReady: boolean;
    unsupportedDraftBundles: boolean;
    selectedCurrency: string;
};

export type CampaignBuilderActions = {
    selectBundle: (bundle: Bundle) => void;
    removeBundle: (bundleId: string) => void;
    setCampaignName: (value: string) => void;
    setDraftMeta: (payload: {
        draftId: string | null;
        draftStep: CampaignDraftLatestStep | null;
        draftRevision?: number;
    }) => void;

    selectOffer: (payload: {
        offerId: string | null;
        accountIds?: string[];
        accounts?: SelectedCampaignAccount[];
        offerName?: string;
        offerPrice?: number;
        offerPrices?: Partial<OfferPrices>;
        catalogContext?: { platform: string; genre: string };
    }) => void;
    setOfferDisplay: (offerId: string, name: string, price: number) => void;

    setSelectedPromoCardIds: (ids: string[]) => void;
    togglePromoCardId: (id: string) => void;
    togglePromoCard: (account: SelectedCampaignAccount) => void;
    setSelectedAccounts: (accounts: SelectedCampaignAccount[]) => void;
    removeSelection: (selectionId: string) => void;
    upsertSelectedAccount: (account: SelectedCampaignAccount) => void;

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
            selectionId?: string;
            socialAccountId: string;
            selectedCampaignContentItem?: {
                campaignContentItemId: string;
                descriptionId: string | null;
                additionalBriefId?: string | null;
            } | null;
            dateRequest?: string;
            profileType?: "creator" | "community";
        }>,
    ) => void;
    setSelectedCurrency: (currency: string) => void;
    hydrateFromDraft: (payload: Pick<CampaignBuilderState,
        "draftId" | "draftStep" | "campaignName" | "totalPrice" | "selectedOfferId" |
        "selectedOfferAccountIds" | "selectedPromoCardIds" | "selectedAccounts" | "campaignContent"
    > & Partial<CampaignBuilderState>) => void;

  setTotalPrice: (value: number) => void;
  reset: () => void;
};

export type CampaignBuilderStore = CampaignBuilderState & {
    actions: CampaignBuilderActions;
};

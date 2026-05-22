import type { CampaignPostContentBlock } from "@/widgets/client-side/campaign-post-content/model/campaign-post-content.types";

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
    dateRequest?: string;
    selectedCampaignContentItem?: SelectedCampaignContentRef | null;
    profileType?: "creator" | "community";
    source?: "manual" | "offer";

    genres?: string[];
    countries?: Array<{
        country: string;
        percentage: number;
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
    selectedOfferPrice: number;
    selectedPromoCardIds: string[];
    selectedOfferAccountIds: string[];
    selectedAccounts: SelectedCampaignAccount[];
    selectedOfferAccounts: SelectedCampaignAccount[];

    campaignContent: CampaignContentItem[];
    postContentDraft: Record<string, unknown> | null;
    blocksDraft: CampaignPostContentBlock[] | null;
    totalPrice: number;
};

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
    }) => void;

    setSelectedPromoCardIds: (ids: string[]) => void;
    togglePromoCardId: (id: string) => void;
    togglePromoCard: (account: SelectedCampaignAccount) => void;
    setSelectedAccounts: (accounts: SelectedCampaignAccount[]) => void;
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
            socialAccountId: string;
            selectedCampaignContentItem?: {
                campaignContentItemId: string;
                descriptionId: string;
            } | null;
            dateRequest?: string;
            profileType?: "creator" | "community";
        }>,
    ) => void;
    hydrateFromDraft: (payload: {
        draftId: string;
        draftStep: "addAccounts" | "addContent" | "strategyTable";
        campaignName: string;
        totalPrice: number;
        selectedOfferId: null;
        selectedOfferAccountIds: any[];
        selectedPromoCardIds: string[];
        selectedAccounts: {
            accountId: string;
            influencerId: string;
            username: string;
            socialMedia: string;
            followers: number;
            profileType: "creator" | "community";
            price: number;
            logoUrl: string;
            source: string;
            selectedCampaignContentItem: { campaignContentItemId: string; descriptionId: string } | null;
            dateRequest: string
        }[];
        campaignContent: any[];
        postContentDraft: null;
        blocksDraft: null
    }) => void;

    setTotalPrice: (value: number) => void;
    reset: () => void;
};

export type CampaignBuilderStore = CampaignBuilderState & {
    actions: CampaignBuilderActions;
};
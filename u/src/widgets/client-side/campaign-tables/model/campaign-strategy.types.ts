import type { RowSelectionState } from "@tanstack/react-table";
import type {
    CampaignContentDescription,
    CampaignContentItem,
    SelectedCampaignAccount,
    SelectedCampaignContentRef,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";

export type StrategyGroup = "main" | "music" | "press";
export type StrategyMode = "readonly" | "readonlyDate" | "edit";
export type MainProfileGroup = "creator" | "community";

export type StrategyCampaign = {
    campaignName: string;
    socialMedia: string;
    totalPrice: number;
    addedAccounts: SelectedCampaignAccount[];
    campaignContent: CampaignContentItem[];
};

export type StrategyRow = {
    accountKey: string;
    account: SelectedCampaignAccount;
    group: StrategyGroup;
    platformItems: CampaignContentItem[];
    selectedItem: CampaignContentItem | null;
    selectedDescription: CampaignContentDescription | null;
    selectedContentIndex: number;
    selectedDescriptionIndex: number;
    dateMode: string;
    dateValue: string;
};

export type StrategyGroupedResult = {
    mainCreator: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
    mainCommunity: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
    music: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
    press: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
};

export type StrategyStoreState = {
    original: StrategyCampaign | null;
    editable: StrategyCampaign | null;
    rowSelection: RowSelectionState;
    recentlyAddedAccountKeys: string[];
    deletingAccountKey: string | null;
};

export type StrategyStoreActions = {
    init: (payload: StrategyCampaign) => void;
    reset: () => void;
    resetToOriginal: () => void;

    setCampaignName: (value: string) => void;
    setRowSelection: (value: RowSelectionState) => void;
    setDeletingAccountKey: (value: string | null) => void;

    setAccountDateRequest: (accountId: string, dateRequest: string) => void;
    setAccountSelectedContent: (
        accountId: string,
        selected: SelectedCampaignContentRef | null,
    ) => void;

    setContentField: (
        contentId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;

    setContentDescriptions: (
        contentId: string,
        descriptions: CampaignContentDescription[],
    ) => void;

    addContentDescription: (contentId: string, text?: string) => string;
    updateContentDescription: (
        contentId: string,
        descriptionId: string,
        value: string,
    ) => void;
    removeContentDescription: (
        contentId: string,
        descriptionId: string,
    ) => void;

    addContentItem: (
        socialMedia: string,
        payload?: Partial<CampaignContentItem>,
        inheritFromContentId?: string,
    ) => {
        contentId: string;
        firstDescriptionId: string;
    };

    removeContentItem: (contentId: string) => void;

    addAccounts: (accounts: SelectedCampaignAccount[]) => void;
    removeAccount: (accountId: string) => void;

    markRecentlyAdded: (accountId: string) => void;
    clearRecentlyAdded: (accountId: string) => void;
};

export type StrategyTableActions = Partial<
    Pick<
        StrategyStoreActions,
        | "setAccountDateRequest"
        | "setAccountSelectedContent"
        | "setContentField"
        | "setContentDescriptions"
        | "addContentItem"
        | "removeContentItem"
        | "removeAccount"
        | "setDeletingAccountKey"
        | "clearRecentlyAdded"
    >
> & {
    recentlyAddedAccountKeys?: string[];
    deletingAccountKey?: string | null;
};

export type StrategyStore = StrategyStoreState & {
    actions: StrategyStoreActions;
};

export type PaymentDetails = {
    firstName: string;
    lastName: string;
    address: string;
    country: string;
    referenceNumber: string;
    amount: number;
    company: string;
    vatNumber: string;
    selectedPaymentMethod: string;
};

export type StrategyDraftPayload = {
    draftId?: string;
    step: "strategyTable";
    campaignName: string;
    socialMedia: string;
    campaignContent: CampaignContentItem[];
    addedAccounts: Array<{
        influencerId: string;
        socialAccountId: string;
        socialMedia: string;
        selectedContent: {
            campaignContentItemId: string;
            descriptionId: string;
        } | null;
        dateRequest?: string;
    }>;
};

export type StrategyProposalPayload = {
    campaignName: string;
    socialMedia: string;
    campaignPrice: number;
    addedAccounts: Array<{
        socialAccountId: string;
        influencerId: string;
        socialMedia: string;
        username: string;
        selectedCampaignContentItem: {
            campaignContentItemId: string;
            descriptionId: string;
        } | null;
        dateRequest: string;
    }>;
    campaignContent: CampaignContentItem[];
};

export type CreateCampaignPayload = StrategyProposalPayload & {
    paymentDetails: PaymentDetails;
};
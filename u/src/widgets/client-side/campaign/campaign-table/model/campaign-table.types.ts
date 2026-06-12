import type {
    EditableCampaignAccount,
    EditableCampaignContentItem,
    EditableDescription,
    SelectedCampaignContentItem,
} from "@/entities/client-side/campaign/store/campaign.store";

export type StrategyGroup = "main" | "music" | "press";

export type CampaignTableSectionData = {
    title: string;
    group: StrategyGroup;
    accounts: EditableCampaignAccount[];
    items: EditableCampaignContentItem[];
};

export type CampaignTableRow = {
    accountKey: string;
    account: EditableCampaignAccount;
    group: StrategyGroup;

    platformItems: EditableCampaignContentItem[];
    selectedItem: EditableCampaignContentItem | null;
    selectedDescription: EditableDescription | null;

    selectedCampaignContentItem: SelectedCampaignContentItem | null;

    selectedContentIndex: number;
    selectedDescriptionIndex: number;

    dateMode: string;
    dateValue: string;
};
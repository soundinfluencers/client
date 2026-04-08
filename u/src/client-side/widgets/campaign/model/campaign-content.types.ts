import type { TableGroup } from "@/client-side/types/table-types";

export type CampaignContentKind = "proposal" | "regular" | "draft";

export type CampaignContentViewMode = -1 | 0 | 1 | 2;

export type CampaignGroupMap<T> = {
    main: T[];
    music: T[];
    press: T[];
};

export type CampaignContentConfig = {
    kind: CampaignContentKind;
    canEdit: boolean;
    showInsightsInsteadOfStrategy: boolean;
    showProposalAddInfluencer: boolean;
    useChangeViewColumns: boolean;
    tableComponent: any;
    liveCanEdit: boolean;
};

export type CampaignContentResolved = {
    kind: CampaignContentKind;
    campaignId: string;
    accounts: any[];
    content: any[];
    byGroup: CampaignGroupMap<any>;
    groupPrices: {
        main: number;
        music: number;
        press: number;
    };
    config: CampaignContentConfig;
};
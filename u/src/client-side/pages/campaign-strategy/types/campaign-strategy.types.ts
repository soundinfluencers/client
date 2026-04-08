import type { CampaignContentItem } from "@/client-side/types/content";
import type { ConnectedAccount } from "@/client-side/types/offers";

export type StrategyViewMode = 0 | 1;

export type StrategyContentGroups = {
    main: CampaignContentItem[];
    music: CampaignContentItem[];
    press: CampaignContentItem[];
};

export type StrategyPromoGroups = {
    mainPromos: ConnectedAccount[];
    musicPromos: ConnectedAccount[];
    otherPromos: ConnectedAccount[];
};

export type ProposalModalState = {
    isOpen: boolean;
    campaignProposalId: string;
    socialType: string;
};
export type ViewMode = -1 | 0 | 1;
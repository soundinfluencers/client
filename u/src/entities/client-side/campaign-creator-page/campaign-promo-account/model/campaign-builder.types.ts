export type SelectedBuilderAccount = {
    accountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
};

export type CampaignBuilderState = {
    selectedOfferId: string | null;
    selectedPromoCardIds: string[];
    selectedAccounts: SelectedBuilderAccount[];
};

export type CampaignBuilderActions = {
    setSelectedOfferId: (offerId: string | null) => void;
    togglePromoCard: (account: SelectedBuilderAccount) => void;
    reset: () => void;
};

export type CampaignBuilderStore = CampaignBuilderState & {
    actions: CampaignBuilderActions;
};
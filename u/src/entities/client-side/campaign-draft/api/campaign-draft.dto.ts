export type DraftAddedAccountDto = {
    influencerId: string;
    socialAccountId: string;
    socialMedia: string;
    username: string;
    logoUrl?: string;
    followers?: number;
    price?: number;
    dateRequest?: string;
    isSelected?: boolean;
    isAvailable?: boolean;
    profileType:  "creator" | "community";
    selectedCampaignContentItem?: {
        campaignContentItemId: string;
        descriptionId?: string;
        additionalBriefId?: string;
    };
    selectedContent?: {
        campaignContentItemId: string;
        descriptionId?: string;
    };
};

export type PromoCreativeSource = "upload" | "photo" | "generated";

export type PromoCreativeDto = {
    id: string;
    assetUrl: string;
    source: PromoCreativeSource;
    sourceAssetUrl?: string;
    styleId?: string;
    headline?: string;
    subheadline?: string;
    generator?: string;
    createdAt: string;
};

export type CampaignContentAvailability =
    | "unknown"
    | "available"
    | "needs_edits"
    | "needs_creation";

export type CampaignBriefDto = {
    budget?: number;
    budgetCurrency?: "EUR" | "GBP" | "USD";
    campaignGoal?: string;
    contentAvailability?: CampaignContentAvailability;
    platforms?: string[];
    countries?: string[];
    dateRequest?: string;
    genre?: string;
    contentStrategy?: string;
    trackName?: string;
    additionalContext?: string;
};

// Read-only compatibility for drafts created before content strategy moved into Brief.
export type CampaignStrategyDto = {
    summary?: string;
    contentStrategy?: string;
    editsNeeded?: string[];
    recommendedPlatforms?: string[];
    recommendedCountries?: string[];
    approved?: boolean;
};

export type CampaignDraftDto = {
    _id: string;
    revision?: number;
    step: "addAccounts" | "addContent" | "strategyTable";
    socialMedia: string;
    campaignName: string;
    brief?: CampaignBriefDto;
    strategy?: CampaignStrategyDto;
    campaignContent?: Array<{
        _id: string;
        socialMedia: string;
        socialMediaGroup: "main" | "music" | "press";
        mainLink: string;
        descriptions: Array<{
            _id: string;
            description: string;
        }>;
        profileType?: "creator" | "community";
        taggedUser: string;
        taggedLink: string;
        additionalBrief: string | Array<{
            _id: string;
            additionalBrief: string;
        }>;
        accountId?: string;
        mediaCache?: Record<string, unknown>;

    }>;
    addedAccounts: DraftAddedAccountDto[];
    totalPrice?: number;
    totalFollowers?: number;
    selectedAccountsCount?: number;
    source?: string;
    noContentAvailable?: boolean;
    promoCreative?: PromoCreativeDto;
};

export type CampaignFilterGroup =
    | "socialMedia"
    | "countries"
    | "profileType"
    | "genres"
    | "addTopics"
    | "communityMusicGenres"
    | "creatorMusicGenres"
    | "communityThemeTopics"
    | "creatorContentFocus"
    | "entertainmentCategories"
    | string;

export type CampaignFilterId = string;

export type CampaignApiTargetGroup =
    | "communityMusicGenres"
    | "communityThemeTopics"
    | "creatorMusicGenres"
    | "creatorContentFocus";

export type CampaignApiTargets = Partial<Record<CampaignApiTargetGroup, string[]>>;

export type CampaignFilterItem = {
    id: string;
    rawId: string;
    apiValue: string;
    group: string;
    filterName: string;
    count: number;
    apiTargets?: CampaignApiTargets;
    children?: CampaignFilterItem[];
};

export type CampaignFilterMethod = "and" | "or";

export type CampaignFilterSection = {
    id: string;
    title: string;
    methods: CampaignFilterMethod[];
    filters: CampaignFilterItem[];
};

export type CampaignCurrencyCode = "EUR" | "USD" | "GBP";

export type CampaignCurrencyOption = {
    key: "€" | "$" | "£";
    currency: CampaignCurrencyCode;
};

export type CampaignSortKey =
    | "bestMatch"
    | "lowestPrice"
    | "highestPrice"
    | "highestFollowers";

export type CampaignSortOption = {
    key: CampaignSortKey;
    name: string;
};

export type CampaignCardsViewMode = "grid" | "table";
export type CampaignFiltersRequestBody = {
    socialMedias: string[];
    profileTypes: string[];
    countries: string[];
    communityMusicGenres: string[];
    communityThemeTopics: string[];
    creatorMusicGenres: string[];
    creatorContentFocus: string[];
};

export type PromoAccountsFiltersBody = CampaignFiltersRequestBody & {
    budget?: number;
    budgetCurrency?: string;
};

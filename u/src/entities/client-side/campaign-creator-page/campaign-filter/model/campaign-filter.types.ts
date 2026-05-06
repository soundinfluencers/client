export type CampaignFilterGroup =
    | "socialMedia"
    | "countries"
    | "genres"
    | "profileType"
    | "addTopics"
    | "musicCategories"
    | "entertainmentCategories"
    | string;

export type CampaignFilterId = string;

export type CampaignFilterItem = {
    id: string;
    rawId: string;
    apiValue: string;
    group: string;
    filterName: string;
    count: number;
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
    musicGenres: string[];
    musicGenresFilterMethod: CampaignFilterMethod;
    countries: string[];
    additionalTopics: string[];
    musicCategories: string[];
    entertainmentCategories: string[];
};

export type PromoAccountsFiltersBody = CampaignFiltersRequestBody & {
    budget?: number;
    budgetCurrency: string;
};
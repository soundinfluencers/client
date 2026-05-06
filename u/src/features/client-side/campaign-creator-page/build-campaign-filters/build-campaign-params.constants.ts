import type {
    CampaignCardsViewMode,
    CampaignCurrencyOption, CampaignFilterMethod,
    CampaignSortOption
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";


export const CAMPAIGN_CURRENCY_OPTIONS: CampaignCurrencyOption[] = [
    { key: "€", currency: "EUR" },
    { key: "$", currency: "USD" },
    { key: "£", currency: "GBP" },
];

export const CAMPAIGN_SORT_OPTIONS: CampaignSortOption[] = [
    { key: "bestMatch", name: "Best Match" },
    { key: "lowestPrice", name: "Lowest Price" },
    { key: "highestPrice", name: "Highest Price" },
    { key: "highestFollowers", name: "Highest Followers" },
];

export const DEFAULT_CAMPAIGN_VIEW: CampaignCardsViewMode = "grid";
export const DEFAULT_FILTER_METHOD: CampaignFilterMethod = "and";
export const DEFAULT_BUDGET = 0;
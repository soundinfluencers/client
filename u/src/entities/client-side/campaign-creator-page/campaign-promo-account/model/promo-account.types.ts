import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";

export type PromoAccountCountry = {
    country: string;
    percentage: number;
};

export type PromoAccountPrices = Record<string, number>;

export type NetworkBundlePreviewPriceMap = Partial<
    Record<CampaignCurrencyCode, number>
>;

export type NetworkBundleAccountPreview = {
    accountId: string;
    username: string;
    socialMedia: string;
    followers: number;
    prices: NetworkBundlePreviewPriceMap;
};

export type NetworkBundlePreview = {
    bundleId: string;
    prices: NetworkBundlePreviewPriceMap;
    originalPrices: NetworkBundlePreviewPriceMap;
    accounts: NetworkBundleAccountPreview[];
};

export type PromoAccount = {
    accountId: string;
    influencerId: string;
    username: string;
    logoUrl: string;
    followers: number;
    prices: PromoAccountPrices;
    socialMedia: string;
    profileType: "creator" | "community";
    countries: PromoAccountCountry[];
    averageViews: number;
    engagementRate: number;
    communityMusicGenres: string[];
    communityThemeTopics: string[];
    creatorMusicGenres: string[];
    creatorContentFocus: string[];
    musicGenres: string[];
    bundlePreviews: NetworkBundlePreview[];
};

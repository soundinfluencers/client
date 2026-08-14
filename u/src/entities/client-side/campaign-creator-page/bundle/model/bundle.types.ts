import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";

export type BundlePriceMap = Partial<
    Record<CampaignCurrencyCode, number>
>;

export type BundleAccountCountry = {
    country: string;
    percentage: number;
};

export type BundleAccount = {
    accountId: string;
    influencerId: string;
    username: string;
    logoUrl: string;
    followers: number;
    prices: BundlePriceMap;
    socialMedia: string;
    profileType: string;
    countries: BundleAccountCountry[];
    engagementRate: number;
    averageViews: number;
    communityMusicGenres: string[];
    communityThemeTopics: string[];
    creatorMusicGenres: string[];
    creatorContentFocus: string[];
};

export type Bundle = {
    bundleId: string;
    influencerId: string;
    prices: BundlePriceMap;
    originalPrices: BundlePriceMap;
    followers: number;
    accounts: BundleAccount[];
    createdAt: string;
};

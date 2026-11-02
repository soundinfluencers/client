import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";

export type BundleSortBy =
    | "bestMatch"
    | "lowestPrice"
    | "highestPrice"
    | "lowestFollowers"
    | "highestFollowers";

export type BundleFilterQueryParams = {
    page: number;
    limit: number;
    sortBy: BundleSortBy;
};

export type BundleFilterBodyDto = {
    socialMedias?: string[];
    profileTypes?: string[];
    communityMusicGenres?: string[];
    communityThemeTopics?: string[];
    creatorMusicGenres?: string[];
    creatorContentFocus?: string[];
    countries?: string[];
    budget?: number;
    budgetCurrency: CampaignCurrencyCode;
};

export type BundlePriceMapDto = Partial<
    Record<CampaignCurrencyCode, number>
>;

export type BundleAccountCountryDto = {
    country: string;
    percentage: number;
};

export type BundleAccountDto = {
    accountId: string;
    influencerId: string;
    username: string;
    logoUrl: string | null;
    followers: number;
    prices: BundlePriceMapDto;
    socialMedia: string;
    profileType: string;
    countries: BundleAccountCountryDto[];
    engagementRate: number;
    averageViews: number;
    communityMusicGenres: string[];
    communityThemeTopics: string[];
    creatorMusicGenres: string[];
    creatorContentFocus: string[];
};

export type BundleDto = {
    bundleId: string;
    influencerId: string;
    prices: BundlePriceMapDto;
    originalPrices: BundlePriceMapDto;
    followers: number;
    accounts: BundleAccountDto[];
    createdAt: string;
};

export type GetFilteredBundlesDataDto = {
    bundles: BundleDto[];
};

export type GetFilteredBundlesResponseDto = {
    statusCode: number;
    message: string;
    data: GetFilteredBundlesDataDto;
};

export type GetBundleByIdResponseDto = {
    statusCode: number;
    message: string;
    data: {
        bundle: BundleDto;
    };
};

export type GetFilteredBundlesRequest = BundleFilterQueryParams & {
    body: BundleFilterBodyDto;
};

export type PromoAccountCountryDto =
    | string
    | {
    country: string;
    percentage: number;
};

export type PromoAccountDto = {
    accountId: string;
    influencerId: string;
    username: string;
    logoUrl: string;
    followers: number;
    prices: Record<string, number>;
    socialMedia: string;
    profileType: "creator" | "community";
    averageViews: number;
    engagementRate: number;
    countries: PromoAccountCountryDto[];
    communityMusicGenres: string[];
    communityThemeTopics: string[];
    creatorMusicGenres: string[];
    creatorContentFocus: string[];
};

export type GetPromoAccountsResponseDto = {
    statusCode: number;
    message: string;
    data: {
        accounts: PromoAccountDto[];
    };
};

export type SearchPromoAccountsBodyDto = {
    query: string;
    socialMedias: string[];
    page: number;
    limit: number;
};

export type SearchPromoAccountsResponseDto = {
    data: {
        accounts: PromoAccountDto[];
    };
};

export type FilterPromoAccountsBodyDto = {
    socialMedias: string[];
    profileTypes: string[];
    countries: string[];
    communityMusicGenres: string[];
    communityThemeTopics: string[];
    creatorMusicGenres: string[];
    creatorContentFocus: string[];
    budget?: number;
    budgetCurrency?: string;
};

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
    musicGenres: string[];
    creatorCategories: string[];
    categories: string[];
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
    musicGenres: string[];
    musicGenresFilterMethod: string;
    countries: string[];
    additionalTopics: string[];
    budget: number;
    budgetCurrency: string;
    musicCategories: string[];
    entertainmentCategories: string[];
};
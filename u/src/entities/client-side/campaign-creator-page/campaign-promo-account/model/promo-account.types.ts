export type PromoAccountCountry = {
    country: string;
    percentage: number;
};

export type PromoAccountPrices = Record<string, number>;

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
    musicGenres: string[];
    creatorCategories: string[];
    categories: string[];
};
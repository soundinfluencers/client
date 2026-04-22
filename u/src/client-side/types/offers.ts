import type { ApiResponse, MongoId, SocialMedia } from "./common";
export interface Country {
    country: string;
    percentage: number;
}
export type ConnectedAccount = {
    accountId: MongoId;
    influencerId: MongoId;
    username: string;
    logoUrl: string;
    followers: number;
    prices: Record<string, number>;
    socialMedia: SocialMedia;
    countries: Country[];
    musicGenres: string[];
    creatorCategories: string[];
    categories: string[];
    engagementRate: number;
    averageViews: number;
};

export type Offer = {
    _id: MongoId;
    title: string;
    socialMedia: SocialMedia;
    connectedAccounts: ConnectedAccount[];
    price: number;
    genre: string;
    combinedFollowers: string;
    networksAmount: number;
    storyAndPostDetails: string;
};

export type GetPublishedOffersResponse = ApiResponse<{
    offers: Offer[];
}>;
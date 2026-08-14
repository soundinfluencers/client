import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";

export type OfferConnectedAccount = {
    accountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    logoUrl: string;
    profileType: "creator" | "community";
    followers: number;
    countries: Array<{
        country: string;
        percentage: number;
    }>;
    communityMusicGenres: string[];
    creatorMusicGenres: string[];
};

export type PublishedOffer = {
    id: string;
    title: string;
    price: number;
    prices: Partial<Record<CampaignCurrencyCode, number>>;
    storyAndPostDetails: string;
    networksAmount: number;
    combinedFollowers: number;
    connectedAccounts: OfferConnectedAccount[];

};

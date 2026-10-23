import type { OfferPrices } from "../../campaign-builder/model/selected-offer";

export type OfferConnectedAccount = {
    accountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    logoUrl: string;
    profileType: "creator" | "community";
    followers: number;
    prices: Partial<OfferPrices>;
    countries?: Array<{ country: string; percentage?: number }>;
    communityMusicGenres?: string[];
    communityThemeTopics?: string[];
    creatorMusicGenres?: string[];
    creatorContentFocus?: string[];
};

export type PublishedOffer = {
    id: string;
    title: string;
    price: number;
    prices: Partial<OfferPrices>;
    storyAndPostDetails: string;
    networksAmount: number;
    combinedFollowers: number;
    connectedAccounts: OfferConnectedAccount[];

};

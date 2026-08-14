import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";

export type OfferConnectedAccountDto = {
    accountId: string;
    influencerId?: string;
    socialMedia: string;
    username: string;
    logoUrl?: string;
    profileType: "creator" | "community";
    followers: number;
    countries?: Array<
        | string
        | {
        country: string;
        percentage: number;
    }
    >;
    communityMusicGenres?: string[];
    creatorMusicGenres?: string[];
};

export type PublishedOfferDto = {
    _id: string;
    title: string;
    price: number | string;
    parsedPrices: Partial<Record<CampaignCurrencyCode, number>>;
    storyAndPostDetails?: string;
    networksAmount?: number | string;
    combinedFollowers?: number | string;
    connectedAccounts: OfferConnectedAccountDto[];
};

export type GetPublishedOffersResponseDto = {
    statusCode?: number;
    message?: string;
    data: PublishedOfferDto[];
};

import type { DisplayCurrency } from "../../campaign-builder/model/selected-offer";

type CurrencyPricesDto = Partial<Record<DisplayCurrency, number | null>> | null;

export type OfferConnectedAccountDto = {
    accountId: string;
    influencerId?: string;
    socialMedia: string;
    username: string;
    logoUrl?: string;
    profileType: "creator" | "community";
    followers: number;
    prices?: CurrencyPricesDto;
    countries?: Array<string | { country: string; percentage?: number }>;
    communityMusicGenres?: string[];
    communityThemeTopics?: string[];
    creatorMusicGenres?: string[];
    creatorContentFocus?: string[];
};

export type PublishedOfferDto = {
    _id: string;
    title: string;
    price: number | string;
    parsedPrices?: CurrencyPricesDto;
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

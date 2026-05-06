export type OfferConnectedAccountDto = {
    accountId: string;
    influencerId?: string;
    socialMedia: string;
    username: string;
    logoUrl?: string;
    profileType: "creator" | "community";
    followers: number;
};

export type PublishedOfferDto = {
    _id: string;
    title: string;
    price: number | string;
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
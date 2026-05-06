export type OfferConnectedAccount = {
    accountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    logoUrl: string;
    profileType: "creator" | "community";
    followers: number;
};

export type PublishedOffer = {
    id: string;
    title: string;
    price: number;
    storyAndPostDetails: string;
    networksAmount: number;
    combinedFollowers: number;
    connectedAccounts: OfferConnectedAccount[];

};
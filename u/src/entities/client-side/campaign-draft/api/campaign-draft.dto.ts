export type DraftAddedAccountDto = {
    influencerId: string;
    socialAccountId: string;
    socialMedia: string;
    username: string;
    logoUrl?: string;
    followers?: number;
    price?: number;
    dateRequest?: string;
    profileType:  "creator" | "community";
    selectedCampaignContentItem?: {
        campaignContentItemId: string;
        descriptionId: string;
    };
};

export type CampaignDraftDto = {
    _id: string;
    step: "addAccounts" | "addContent" | "strategyTable";
    socialMedia: string;
    campaignName: string;
    campaignContent?: Array<{
        _id: string;
        socialMedia: string;
        socialMediaGroup: "main" | "music" | "press";
        mainLink: string;
        descriptions: Array<{
            _id: string;
            description: string;
        }>;
        profileType?: "creator" | "community";
        taggedUser: string;
        taggedLink: string;
        additionalBrief: string;
        accountId?: string;
        mediaCache?: any;

    }>;
    addedAccounts: DraftAddedAccountDto[];
    totalPrice?: number;
};
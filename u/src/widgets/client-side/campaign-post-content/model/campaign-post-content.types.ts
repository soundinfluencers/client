export type CampaignContentAudience = "creator" | "community";
export type CampaignBlockAudience = CampaignContentAudience | "both";

export type CampaignContentGroup = "main" | "music" | "press";

export type CampaignPostContentDescription = {
    id: string;
    value: string;
};

export type CampaignPostContentFields = {
    mainLink: string;
    descriptions: CampaignPostContentDescription[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
};

export type CampaignPostContentTarget = {
    socialMedia: string;
    profileType?: CampaignContentAudience;
};

export type CampaignPostContentAccount = {
    accountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    profileType?: CampaignContentAudience;
    logoUrl?: string;
    followers?: number;
    price?: number;
    dateRequest?: string;
    source?: "offer" | "manual";
};

export type CampaignPostContentBlock = {
    id: string;
    group: CampaignContentGroup;
    platform: string;
    audience?: CampaignBlockAudience;
    targetSocialMedias: string[];
    isAdditional: boolean;
    isRemovable: boolean;
    fields: CampaignPostContentFields;
};

export type BuiltCampaignContentItem = {
    _id: string;
    socialMedia: string;
    socialMediaGroup: CampaignContentGroup;
    profileType?: CampaignContentAudience;
    mainLink: string;
    descriptions: Array<{
        _id: string;
        description: string;
    }>;
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
};

export type BuiltCampaignContentWithMeta = BuiltCampaignContentItem & {
    meta: {
        blockId: string;
        platform: string;
        group: CampaignContentGroup;
        targetSocialMedia: string;
        targetProfileType?: CampaignContentAudience;
    };
};

export type BuiltAddedAccount = {
    socialAccountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    profileType?: CampaignContentAudience;
    selectedCampaignContentItem: {
        campaignContentItemId: string;
        descriptionId: string;
    };
    dateRequest: string;
};

export type BuiltCampaignPostContentPayload = {
    campaignName: string;
    socialMedia: string;
    campaignPrice: number;
    addedAccounts: BuiltAddedAccount[];
    campaignContent: BuiltCampaignContentItem[];
    profileType?: CampaignContentAudience;
};

export type AdditionalMainTarget = CampaignContentAudience;
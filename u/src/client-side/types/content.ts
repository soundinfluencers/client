import type { MongoId, SocialMedia } from "./common";

export type CampaignDescription = {
    _id: MongoId;
    description: string;
};

export type SelectedContentRef = {
    campaignContentItemId: MongoId;
    descriptionId: MongoId;
};

export type CampaignContentItem = {
    _id: MongoId;
    socialMedia: SocialMedia;
    socialMediaGroup: string;
    mainLink: string;
    descriptions: CampaignDescription[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
    mediaCache?: Record<string, unknown>;
};

export type CampaignSelectedContentItem = {
    _id: MongoId;
    socialMedia: SocialMedia;
    socialMediaGroup: string;
    mainLink: string;
    description: string;
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
};
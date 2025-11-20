import type {SocialMediaType} from "./utils/constants.types.ts";

export type CampaignStatusType =
    'Pending' |
    'Distributing' |
    'Completed' ;

export interface CampaignForList {
    _id: string;
    campaignName: string;
    socialMedia: SocialMediaType | 'multipromo';
    creationDate: string;
    price: string;
    status: CampaignStatusType;
}
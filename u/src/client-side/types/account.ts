import type {
    ClosePromoStatus,
    ConfirmationStatus,
    MongoId,
    SocialMedia,
} from "./common";
import type {
    CampaignSelectedContentItem,
    SelectedContentRef,
} from "./content";

export type CampaignAccountRequestItem = {
    socialAccountId: MongoId;
    influencerId: MongoId;
    socialMedia: SocialMedia;
    username: string;
    selectedCampaignContentItem: SelectedContentRef;
    dateRequest: string;
};

export type DraftAccountItem = {
    influencerId: MongoId;
    socialAccountId: MongoId;
    socialMedia: SocialMedia;
    selectedContent: SelectedContentRef;
    username?: string;
    logoUrl?: string;
    followers?: number;
    price?: number;
};

export type CampaignAddedAccount = {
    addedAccountsId: MongoId;
    socialAccountId: MongoId;
    influencerId: MongoId;
    socialMedia: SocialMedia;
    username: string;
    publicPrice: number;
    followers: number;
    selectedContent: SelectedContentRef;
    selectedContentItem: CampaignSelectedContentItem;
    confirmation: ConfirmationStatus;
    closePromo: ClosePromoStatus;
    dateRequest: string;
    datePost: string;
    postLink: string;
    screenshot: string;
    impressions: number;
    like: number;
    comments: number;
    shares: number;
    saves: number;
    rating: number;
    genres: string[];
    countries: unknown[];
    logoUrl: string;
};
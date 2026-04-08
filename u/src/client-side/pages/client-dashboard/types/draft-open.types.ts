import type { CampaignDraftLatestStep } from "@/client-side/types/draft.types";

import type { SocialMedia } from "@/client-side/types/common";
import type {CampaignContentItem} from "@/client-side/types/content.ts";

export type DraftAddedAccount = {
    influencerId: string;
    socialAccountId: string;
    socialMedia: SocialMedia;
    username: string;
    logoUrl?: string;
    followers?: number;
    price?: number;
    selectedContent: {
        campaignContentItemId: string;
        descriptionId: string;
    };
};

export type DraftDetailsResponse = {
    _id: string;
    campaignName: string;
    socialMedia: SocialMedia;
    step: CampaignDraftLatestStep;
    addedAccounts: DraftAddedAccount[];
    campaignContent: CampaignContentItem[];
    totalPrice: number;
};
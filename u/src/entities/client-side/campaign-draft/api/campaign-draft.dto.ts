import type { DisplayCurrency, DraftSelectedOffer, OfferPrices } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";

export type DraftAddedAccountDto = {
    selectionId: string;
    source: "offer" | "standalone" | "bundle";
    offerId?: string;
    bundleId?: string;
    influencerId: string;
    socialAccountId: string;
    socialMedia: string;
    username: string;
    logoUrl?: string;
    followers?: number;
    countries?: Array<{ country: string; percentage?: number }>;
    communityMusicGenres?: string[];
    communityThemeTopics?: string[];
    creatorMusicGenres?: string[];
    creatorContentFocus?: string[];
    prices: OfferPrices;
    isAvailable?: boolean;
    unavailableReason?: string;
    dateRequest?: string;
    profileType?: "creator" | "community";
    selectedCampaignContentItem?: {
        campaignContentItemId: string;
        descriptionId: string | null;
        additionalBriefId?: string | null;
    } | null;
};

export type CampaignDraftDto = {
    selectedOffer?: DraftSelectedOffer | null;
    _id: string;
    step: "addAccounts" | "addContent" | "strategyTable";
    socialMedia: string;
    campaignName?: string | null;
    displayCurrency: DisplayCurrency;
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
        additionalBrief: string | Array<{
            _id: string;
            additionalBrief: string;
        }>;
        accountId?: string;
        mediaCache?: any;

    }>;
    addedAccounts: DraftAddedAccountDto[];
    addedBundles?: unknown[];
};

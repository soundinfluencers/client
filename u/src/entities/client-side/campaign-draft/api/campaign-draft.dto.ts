import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";
import type {
    CampaignContentItem,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";

export type CampaignDraftSource = "standalone" | "bundle" | "offer";

export type CampaignDraftCurrency = CampaignCurrencyCode;

export type CampaignDraftStep =
    | "addAccounts"
    | "addContent"
    | "strategyTable";

export type CampaignDraftSocialMedia =
    | "instagram"
    | "facebook"
    | "tiktok"
    | "youtube"
    | "spotify"
    | "soundcloud"
    | "press"
    | "multipromo";

export type CampaignDraftAccountSocialMedia = Exclude<
    CampaignDraftSocialMedia,
    "multipromo"
>;

export type CampaignDraftContentReference = {
    campaignContentItemId: string;
    descriptionId: string;
    additionalBriefId?: string;
};

export type CampaignDraftAccountPayload = {
    selectionId: string;
    source: CampaignDraftSource;
    bundleId?: string;
    offerId?: string;
    influencerId: string;
    socialAccountId: string;
    socialMedia: CampaignDraftAccountSocialMedia;
    dateRequest: string;
    selectedCampaignContentItem?: CampaignDraftContentReference;
};

export type CampaignDraftSelectedOfferPayload = {
    offerId: string;
    selectedAccountIds: string[];
};

export type SaveCampaignDraftPayload = {
    draftId?: string;
    campaignName: string;
    socialMedia: CampaignDraftSocialMedia;
    displayCurrency: CampaignDraftCurrency;
    step: CampaignDraftStep;
    addedAccounts: CampaignDraftAccountPayload[];
    selectedOffer?: CampaignDraftSelectedOfferPayload;
    campaignContent: CampaignContentItem[];
};

export type CampaignDraftSaveOperation = "created" | "updated";

export type CampaignDraftSaveResult = {
    draftId: string;
    operation: CampaignDraftSaveOperation;
    updatedAt: string;
};

export type CampaignDraftSaveResponseDto = {
    statusCode: 200 | 201;
    message: string;
    data: CampaignDraftSaveResult;
};

export type CampaignDraftPriceMap = Partial<
    Record<CampaignDraftCurrency, number>
>;

export type CampaignDraftAccountGetDto = {
    selectionId: string;
    source: CampaignDraftSource;
    bundleId?: string;
    offerId?: string;
    influencerId: string;
    socialAccountId: string;
    socialMedia: CampaignDraftAccountSocialMedia;
    username: string;
    logoUrl: string;
    profileType?: "community" | "creator";
    countries?: Array<{
        country: string;
        percentage: number;
    }>;
    communityMusicGenres?: string[];
    communityThemeTopics?: string[];
    creatorMusicGenres?: string[];
    creatorContentFocus?: string[];
    followers: number;
    prices: CampaignDraftPriceMap;
    dateRequest: string;
    selectedCampaignContentItem?: CampaignDraftContentReference;
    isAvailable: boolean;
    unavailableReason?: string;
};

export type CampaignDraftBundleGetDto = {
    bundleId: string;
    influencerId: string;
    prices: CampaignDraftPriceMap;
    originalPrices: CampaignDraftPriceMap;
    selectedAccountIds: string[];
    currentAccountIds: string[];
    isAvailable: boolean;
    unavailableReason?: string;
};

export type CampaignDraftOfferGetDto = {
    offerId: string;
    title: string;
    socialMedia: string;
    genre: string;
    selectedAccountIds: string[];
    currentAccountIds: string[];
    prices: CampaignDraftPriceMap;
    isAvailable: boolean;
    unavailableReason?: string;
};

export type CampaignDraftGetDto = {
    _id: string;
    step: CampaignDraftStep;
    socialMedia: CampaignDraftSocialMedia;
    displayCurrency: CampaignDraftCurrency;
    campaignName: string;
    campaignContent: CampaignContentItem[];
    addedAccounts: CampaignDraftAccountGetDto[];
    addedBundles: CampaignDraftBundleGetDto[];
    selectedOffer?: CampaignDraftOfferGetDto | null;
};

export type CampaignDraftGetEnvelope = {
    statusCode: 200;
    message: string;
    data: CampaignDraftGetDto;
};

// Compatibility names for callers that have not yet moved to the explicit
// GET v2 type names.
export type DraftAddedAccountDto = CampaignDraftAccountGetDto;
export type CampaignDraftDto = CampaignDraftGetDto;

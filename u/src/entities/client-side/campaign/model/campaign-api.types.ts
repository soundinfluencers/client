import type {
    CampaignDisplayCurrency,
} from "@/shared/functions/formatCurrency.ts";

export type CampaignSocialMedia =
    | "instagram"
    | "facebook"
    | "youtube"
    | "tiktok"
    | "spotify"
    | "soundcloud"
    | string;

export type CampaignStatus =
    | "under_review"
    | "distribution"
    | "completed"
    | string;

export type CampaignSocialMediaGroup = "main" | "music" | "press" | string;

export type CampaignProfileType = "community" | "creator" | string;

export type SelectedCampaignContentItem = {
    campaignContentItemId: string;
    descriptionId: string;
    additionalBriefId?: string;
};

export type AdditionalBriefVersionDto = {
    _id: string;
    additionalBrief: string;
};

export type CampaignContentDescriptionDto = {
    _id: string;
    description: string;
};

export type CampaignContentItemDto = {
    _id: string;
    socialMedia: CampaignSocialMedia;
    profileType?: CampaignProfileType;
    socialMediaGroup: CampaignSocialMediaGroup;
    mainLink: string;
    descriptions: CampaignContentDescriptionDto[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: AdditionalBriefVersionDto[];
    mediaCache?: any;
};

export type SelectedContentItemDto = {
    _id: string;
    socialMedia: CampaignSocialMedia;
    socialMediaGroup: CampaignSocialMediaGroup;
    mainLink: string;
    description: string;
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
};

export type CampaignAddedAccountDto = {
    addedAccountsId?: string;
    socialAccountId: string;
    influencerId: string;
    socialMedia: CampaignSocialMedia;
    username: string;
    publicPrice: number;
    followers: number;

    selectedContent?: SelectedCampaignContentItem | null;
    selectedCampaignContentItem?: SelectedCampaignContentItem | null;
    selectedContentItem?: SelectedContentItemDto | null;

    confirmation?: "accept" | "wait" | "reject" | string;
    closePromo?: "close" | "wait" | string;

    dateRequest?: string;
    datePost?: string;
    postLink?: string;
    screenshot?: string;

    impressions?: number;
    like?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    rating?: number;

    genres?: string[];
    countries?: any[];
    logoUrl?: string;
    profileType?: CampaignProfileType;
};

export type RegularCampaignDto = {
    campaignId: string;
    campaignName: string;
    socialMedia: CampaignSocialMedia;
    creationDate: string;
    price: number;
    displayCurrency: CampaignDisplayCurrency;
    status: CampaignStatus;

    addedAccounts: CampaignAddedAccountDto[];
    campaignContent: CampaignContentItemDto[];

    shareLink: string;

    totalFollowers: number;
    totalImpressions: number;
    totalLikes: number;
    totalSaves: number;
    totalComments: number;
    totalShares: number;

    isCpmAndResultHidden: boolean;
    isPriceHidden: boolean;
    hiddenColumns: string[];

    cpm: number;
    canEdit: boolean;
};

export type ProposalSocialAccountId = string;
export type ProposalAddedAccountId = string;
export type ProposalBundleId = string;
export type ProposalCampaignBundleId = string;
export type ProposalOfferId = string;
export type ProposalCampaignOfferId = string;

export type ProposalAddedAccountDto = CampaignAddedAccountDto & {
    _id?: string;
    accountId?: string;
    addedAccountsId: ProposalAddedAccountId;
    bundleId?: ProposalBundleId;
    campaignBundleId?: ProposalCampaignBundleId;
    bundlePosition?: number;
};

export type ProposalBundleSnapshotDto = {
    campaignBundleId: ProposalCampaignBundleId;
    bundleId: ProposalBundleId;
    influencerId: string;
    acceptancePolicy: "all_or_nothing";
    influencerReward: number;
    clientPrice: number;
    originalInfluencerReward: number;
    originalClientPrice: number;
    pricingStrategy: "proportional";
    currency: CampaignDisplayCurrency;
    snapshotAt: string;
};

export type ProposalOfferSnapshotDto = {
    campaignOfferId: ProposalCampaignOfferId;
    offerId: ProposalOfferId;
    selectedAccountIds: ProposalSocialAccountId[];
    selectedAddedAccountsIds: ProposalAddedAccountId[];
    overlapAccountIds: ProposalSocialAccountId[];
    title: string;
    socialMedia: CampaignSocialMedia;
    genre: string;
    clientPrice: number;
    originalClientPrice: number;
    currency: CampaignDisplayCurrency;
    snapshotAt: string;
};

export type ProposalOptionDto = {
    optionIndex: number;
    price: number;
    displayCurrency: CampaignDisplayCurrency;
    addedAccounts: ProposalAddedAccountDto[];
    addedBundles: ProposalBundleSnapshotDto[];
    selectedOffer?: ProposalOfferSnapshotDto | null;
    campaignContent: CampaignContentItemDto[];
    canEdit: boolean;
};

export type ProposalCampaignDto = {
    campaignId: string;
    campaignName: string;
    socialMedia: CampaignSocialMedia;
    existingOptions: number[];
    selectedOption: ProposalOptionDto;
};

export type CreateProposalOptionResult = {
    campaignId: string;
    optionIndex: number;
};

export type ApiResponse<T> = {
    statusCode: number;
    message: string;
    data: T;
};

export type CreateProposalOptionResponse =
    ApiResponse<CreateProposalOptionResult>;

export type CampaignAccountPatchDto = {
    addedAccountsId?: string;
    socialAccountId: string;
    influencerId: string;
    socialMedia: CampaignSocialMedia;
    username: string;
    selectedCampaignContentItem: SelectedCampaignContentItem | null;
    dateRequest: string;
};

type ProposalAddedAccountInputBase = {
    bundleId?: ProposalBundleId;
    socialAccountId: ProposalSocialAccountId;
    influencerId: string;
    socialMedia: CampaignSocialMedia;
    username: string;
    dateRequest: string;
};

export type CreateProposalAddedAccountInput = ProposalAddedAccountInputBase & {
    addedAccountsId?: ProposalAddedAccountId;
    selectedCampaignContentItem?: SelectedCampaignContentItem;
};

type PatchProposalAddedAccountInputBase = ProposalAddedAccountInputBase & {
    selectedCampaignContentItem: SelectedCampaignContentItem;
};

export type ExistingProposalAddedAccountPatchInput =
    PatchProposalAddedAccountInputBase & {
        addedAccountsId: ProposalAddedAccountId;
    };

export type NewProposalAddedAccountPatchInput =
    PatchProposalAddedAccountInputBase & {
        addedAccountsId?: never;
    };

export type PatchProposalAddedAccountInput =
    | ExistingProposalAddedAccountPatchInput
    | NewProposalAddedAccountPatchInput;

export type ProposalSelectedOfferInput = {
    offerId: ProposalOfferId;
    selectedAccountIds: ProposalSocialAccountId[];
    selectedAddedAccountsIds?: ProposalAddedAccountId[];
};

export type CampaignContentPatchDto = {
    _id: string;
    socialMedia: CampaignSocialMedia;
    profileType?: CampaignProfileType;
    socialMediaGroup: CampaignSocialMediaGroup;
    mainLink: string;
    descriptions: CampaignContentDescriptionDto[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: AdditionalBriefVersionDto[];
};

export type CampaignPatchBody = {
    campaignName: string;
    isCpmAndResultHidden?: boolean;
    isPriceHidden?: boolean;
    addedAccounts: CampaignAccountPatchDto[];
    campaignContent: CampaignContentPatchDto[];
};

export type PaymentDetailsDto = {
    firstName: string;
    lastName: string;
    address: string;
    country: string;
    referenceNumber: string;
    amount: number;
    company: string;
    vatNumber: string;
    poNumber: string;
    selectedPaymentMethod: string;
};

export type CreateRegularCampaignPaymentDetailsInput = {
    firstName: string;
    lastName: string;
    address: string;
    country: string;
    referenceNumber: string;
    amount: number;
    company?: string;
    vatNumber?: string;
    selectedPaymentMethod: string;
};

export type CreateRegularCampaignAddedAccountInput = {
    bundleId?: string;
    socialAccountId: string;
    influencerId: string;
    socialMedia: CampaignSocialMedia;
    username: string;
    selectedCampaignContentItem?: SelectedCampaignContentItem;
    dateRequest: string;
    profileType?: CampaignProfileType;
};

export type CreateRegularCampaignRequest = {
    campaignName: string;
    socialMedia: CampaignSocialMedia;
    campaignPrice: number;
    displayCurrency: CampaignDisplayCurrency;
    addedAccounts: CreateRegularCampaignAddedAccountInput[];
    campaignContent: CampaignContentPatchDto[];
    paymentDetails: CreateRegularCampaignPaymentDetailsInput;
};

export type CreateProposalCampaignRequest = {
    campaignName: string;
    socialMedia: CampaignSocialMedia;
    campaignPrice: number;
    displayCurrency: CampaignDisplayCurrency;
    addedAccounts: CreateProposalAddedAccountInput[];
    campaignContent: CampaignContentPatchDto[];
    paymentDetails?: PaymentDetailsDto;
    selectedOffer?: ProposalSelectedOfferInput;
};

export type UpdateProposalCampaignRequest = {
    campaignName?: string;
    isCpmAndResultHidden?: boolean;
    isPriceHidden?: boolean;
    addedAccounts?: PatchProposalAddedAccountInput[];
    campaignContent?: CampaignContentPatchDto[];
    campaignPrice?: number;
    displayCurrency?: CampaignDisplayCurrency;
    selectedOffer?: ProposalSelectedOfferInput | null;
};

export type ProposalSystemPostBody = CreateProposalCampaignRequest;

export type AddProposalOptionRequest = CreateProposalCampaignRequest & {
    paymentType: string;
};

export type GetCampaignParams = {
    optionIndex?: number;
};

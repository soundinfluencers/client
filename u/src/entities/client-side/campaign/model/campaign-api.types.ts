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
    additionalBrief: string;
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
    displayCurrency: string;
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

export type ProposalOptionDto = {
    optionIndex: number;
    price: number;
    addedAccounts: CampaignAddedAccountDto[];
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

export type ApiResponse<T> = {
    statusCode: number;
    message: string;
    data: T;
};

export type CampaignAccountPatchDto = {
    addedAccountsId?: string;
    socialAccountId: string;
    influencerId: string;
    socialMedia: CampaignSocialMedia;
    username: string;
    selectedCampaignContentItem: SelectedCampaignContentItem | null;
    dateRequest: string;
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
    additionalBrief: string;
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

export type ProposalSystemPostBody = {
    campaignName: string;
    socialMedia: CampaignSocialMedia;
    campaignPrice: number;
    addedAccounts: CampaignAccountPatchDto[];
    campaignContent: CampaignContentPatchDto[];
    paymentDetails: PaymentDetailsDto;
};

export type GetCampaignParams = {
    optionIndex?: number;
};
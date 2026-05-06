

type FormSelectedContent = {
    campaignContentItemId: string;
    descriptionId: string;
};

type FormAddedAccount = {
    socialAccountId: string;
    influencerId: string;
    socialMedia: string;
    username: string;
    selectedCampaignContentItem?: FormSelectedContent;
    profileType?: "creator" | "community";
    dateRequest?: string;
    followers?: number;
    price?: number;
    logoUrl?: string;
};

type FormDescription = {
    _id: string;
    description: string;
};

type FormCampaignContentItem = {
    _id: string;
    socialMedia: string;
    socialMediaGroup: "main" | "music" | "press";
    profileType?: "creator" | "community";
    mainLink: string;
    descriptions: FormDescription[];
    taggedUser: string;
    taggedLink: string;
    additionalBrief: string;
};

export type CampaignStrategyPayload = {
    campaignName: string;
    socialMedia: string;
    campaignPrice: number;
    addedAccounts: FormAddedAccount[];
    campaignContent: FormCampaignContentItem[];
};

export type CampaignStrategyTableData = {
    campaignName: string;
    socialMedia: string;
    totalPrice: number;
    networks: any[];
    items: any[];
};

export const mapCampaignPayloadToTableData = (
    payload: CampaignStrategyPayload,
): CampaignStrategyTableData => {
    const networks: any[] = payload.addedAccounts.map((account) => ({
        addedAccountsId: account.socialAccountId,
        socialAccountId: account.socialAccountId,
        influencerId: account.influencerId,
        socialMedia: String(account.socialMedia ?? "").toLowerCase(),
        username: account.username,
        followers: Number(account.followers ?? 0),
        publicPrice: Number(account.price ?? 0),
        logoUrl: account.logoUrl ?? "",
        genres: [],
        countries: [],
        selectedCampaignContentItem: account.selectedCampaignContentItem
            ? {
                campaignContentItemId: String(
                    account.selectedCampaignContentItem.campaignContentItemId,
                ),
                descriptionId: String(
                    account.selectedCampaignContentItem.descriptionId,
                ),
            }
            : null,
        dateRequest: account.dateRequest ?? "ASAP",
        postLink: "",
        screenshot: "",
        impressions: 0,
        like: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        rating: 0,
        cpm: 0,
        confirmation: "",
        closePromo: "",
        datePost: "",
        statusLabel: "",
    }));

    const items: any[] = payload.campaignContent.map((item) => ({
        _id: String(item._id),
        socialMedia: String(item.socialMedia ?? "").toLowerCase(),
        socialMediaGroup: item.socialMediaGroup,
        mainLink: String(item.mainLink ?? ""),
        descriptions: (item.descriptions ?? []).map((desc) => ({
            _id: String(desc._id),
            description: String(desc.description ?? ""),
        })),
        taggedUser: String(item.taggedUser ?? ""),
        taggedLink: String(item.taggedLink ?? ""),
        additionalBrief: String(item.additionalBrief ?? ""),
        mediaCache: {},
    }));

    return {
        campaignName: payload.campaignName,
        socialMedia: payload.socialMedia,
        totalPrice: Number(payload.campaignPrice ?? 0),
        networks,
        items,
    };
};
import type {
    CampaignContentItem,
    SelectedCampaignAccount,
} from "./campaign-builder.types";

type PostContentPayload = {
    campaignName: string;
    socialMedia: string;
    campaignPrice: number;
    addedAccounts: Array<{
        socialAccountId: string;
        influencerId: string;
        socialMedia: string;
        username: string;
        selectedCampaignContentItem: {
            campaignContentItemId: string;
            descriptionId: string;
        };
        profileType?: "creator" | "community";
        dateRequest?: string;
    }>;
    campaignContent: Array<{
        _id: string;
        socialMedia: string;
        socialMediaGroup: "main" | "music" | "press";
        profileType?: "creator" | "community";
        mainLink: string;
        descriptions: Array<{
            _id: string;
            description: string;
        }>;
        taggedUser: string;
        taggedLink: string;
        additionalBrief: string;
    }>;
};

export const mapPostContentPayloadToSelectedAccounts = ({
                                                            payload,
                                                            currentAccounts,
                                                        }: {
    payload: PostContentPayload;
    currentAccounts: SelectedCampaignAccount[];
}): SelectedCampaignAccount[] => {
    return payload.addedAccounts.map((item) => {
        const sourceAccount = currentAccounts.find(
            (account) => String(account.accountId) === String(item.socialAccountId),
        );

        return {
            accountId: String(item.socialAccountId),
            influencerId: String(item.influencerId),
            socialMedia: String(item.socialMedia),
            username: String(item.username),
            logoUrl: sourceAccount?.logoUrl,
            followers: sourceAccount?.followers,
            price: sourceAccount?.price,
            source: sourceAccount?.source,
            profileType:
                item.profileType ??
                sourceAccount?.profileType ??
                "community",
            dateRequest: item.dateRequest ?? sourceAccount?.dateRequest ?? "ASAP",
            selectedCampaignContentItem: item.selectedCampaignContentItem,
        };
    });
};

export const mapPostContentPayloadToCampaignContent = (
    payload: PostContentPayload,
): CampaignContentItem[] => {
    return payload.campaignContent.map((item) => ({
        _id: item._id,
        socialMedia: item.socialMedia,
        socialMediaGroup: item.socialMediaGroup,
        profileType: item.profileType,
        mainLink: item.mainLink,
        descriptions: item.descriptions.map((desc) => ({
            _id: desc._id,
            description: desc.description,
        })),
        taggedUser: item.taggedUser,
        taggedLink: item.taggedLink,
        additionalBrief: item.additionalBrief,
    }));
};
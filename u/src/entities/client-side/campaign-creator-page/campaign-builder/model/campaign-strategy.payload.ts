type BuildStrategyBaseParams = {
    campaignName: string;
    totalPrice?: number;
    draftId?: string | null;
    accounts: any[];
    content: any[];
};

const mapAccountsForStrategy = (accounts: any[]) =>
    accounts.map((account) => ({
        socialAccountId: String(account.accountId ?? ""),
        influencerId: String(account.influencerId ?? ""),
        socialMedia: String(account.socialMedia ?? ""),
        username: String(account.username ?? ""),
        selectedCampaignContentItem: account.selectedCampaignContentItem
            ? {
                campaignContentItemId: String(
                    account.selectedCampaignContentItem.campaignContentItemId ?? "",
                ),
                descriptionId: String(
                    account.selectedCampaignContentItem.descriptionId ?? "",
                ),
            }
            : undefined,
        dateRequest: String(account.dateRequest ?? "ASAP"),
        profileType: String(account.profileType ?? "community"),
    }));

const mapContentForStrategy = (content: any[]) =>
    content.map((item) => ({
        _id: String(item._id ?? ""),
        socialMedia: String(item.socialMedia ?? ""),
        socialMediaGroup: String(item.socialMediaGroup ?? ""),
        mainLink: String(item.mainLink ?? ""),
        descriptions: (item.descriptions ?? []).map((description: any) => ({
            _id: String(description._id ?? ""),
            description: String(description.description ?? ""),
        })),
        taggedUser: String(item.taggedUser ?? ""),
        taggedLink: String(item.taggedLink ?? ""),
        additionalBrief: String(item.additionalBrief ?? ""),
        profileType: String(item.profileType ?? "community"),
    }));

const resolveStrategySocialMedia = (items: any[]) => {
    const socials = Array.from(
        new Set(
            items
                .map((item) => String(item.socialMedia ?? "").trim().toLowerCase())
                .filter(Boolean),
        ),
    );

    if (socials.length === 0) return "instagram";
    if (socials.length === 1) return socials[0];

    return "multipromo";
};

export const buildStrategyDraftPayload = ({
                                              campaignName,
                                              draftId,
                                              accounts,
                                              content,
                                          }: BuildStrategyBaseParams) => ({
    ...(draftId ? { draftId } : {}),
    step: "strategyTable",
    campaignName: String(campaignName ?? ""),
    socialMedia: resolveStrategySocialMedia(content),
    addedAccounts: mapAccountsForStrategy(accounts),
    campaignContent: mapContentForStrategy(content),
});

export const buildStrategyProposalPayload = ({
                                                 campaignName,
                                                 totalPrice,
                                                 accounts,
                                                 content,
                                             }: BuildStrategyBaseParams) => ({
    campaignName: String(campaignName ?? ""),
    socialMedia: resolveStrategySocialMedia(content),
    campaignPrice: Number(totalPrice ?? 0),
    addedAccounts: mapAccountsForStrategy(accounts),
    campaignContent: mapContentForStrategy(content),
});

export const buildStrategyCreateCampaignPayload = ({
                                                       campaignName,
                                                       totalPrice,
                                                       accounts,
                                                       content,
                                                       paymentDetails,
                                                   }: BuildStrategyBaseParams & {
    paymentDetails: {
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
}) => ({
    campaignName: String(campaignName ?? ""),
    socialMedia: resolveStrategySocialMedia(content),
    campaignPrice: Number(totalPrice ?? 0),
    addedAccounts: mapAccountsForStrategy(accounts),
    campaignContent: mapContentForStrategy(content),
    paymentDetails,
});
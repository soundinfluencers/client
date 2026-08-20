import type {
    CreateRegularCampaignRequest,
    CreateProposalCampaignRequest,
} from "@/entities/client-side/campaign/model/campaign-api.types";
import {
    isCampaignDisplayCurrency,
    type CampaignDisplayCurrency,
} from "@/shared/functions/formatCurrency";
import type {
    CampaignContentItem,
    SelectedCampaignAccount,
} from "./campaign-builder.types";
import {
    normalizeAdditionalBriefVersions,
    resolveAdditionalBriefId,
} from "@/entities/client-side/campaign/model/campaign-content";

type BuildStrategyBaseParams = {
    campaignName: string;
    totalPrice?: number;
    draftId?: string | null;
    accounts: SelectedCampaignAccount[];
    content: CampaignContentItem[];
};

type BuildStrategyProposalParams = Pick<
    BuildStrategyBaseParams,
    "campaignName" | "accounts" | "content"
> & {
    totalPrice: number;
    displayCurrency: CampaignDisplayCurrency;
    selectedOfferId: string | null;
    selectedOfferAccountIds: string[];
};

type BuildStrategyCreateCampaignParams = BuildStrategyBaseParams & {
    displayCurrency: CampaignDisplayCurrency;
    paymentDetails: CreateRegularCampaignRequest["paymentDetails"];
};

export const requireRegularCampaignDisplayCurrency = (
    value: unknown,
): CampaignDisplayCurrency => {
    if (!isCampaignDisplayCurrency(value)) {
        throw new Error("Campaign currency is required before payment");
    }

    return value;
};

const mapAccountsForStrategy = (
    accounts: SelectedCampaignAccount[],
    content: CampaignContentItem[],
) =>
    accounts.map((account) => ({
        socialAccountId: String(account.accountId ?? ""),
        influencerId: String(account.influencerId ?? ""),
        socialMedia: String(account.socialMedia ?? ""),
        username: String(account.username ?? ""),
        selectedCampaignContentItem: account.selectedCampaignContentItem
            ? (() => {
                const selectedContent = content.find(
                    (item) => String(item._id) === String(
                        account.selectedCampaignContentItem?.campaignContentItemId,
                    ),
                );
                const additionalBriefId = resolveAdditionalBriefId(
                    selectedContent?.additionalBrief ?? [],
                    account.selectedCampaignContentItem.additionalBriefId,
                );

                return {
                campaignContentItemId: String(
                    account.selectedCampaignContentItem.campaignContentItemId ?? "",
                ),
                descriptionId: String(
                    account.selectedCampaignContentItem.descriptionId ?? "",
                ),
                ...(additionalBriefId ? { additionalBriefId } : {}),
                };
            })()
            : undefined,
        dateRequest: String(account.dateRequest ?? "ASAP"),
        profileType: String(account.profileType ?? "community"),
    }));

const mapAccountsForCreateCampaign = (
    accounts: BuildStrategyBaseParams["accounts"],
    content: BuildStrategyBaseParams["content"],
) =>
    mapAccountsForStrategy(accounts, content).map((mappedAccount, index) => {
        const bundleId = accounts[index]?.bundleId;

        return {
            ...mappedAccount,
            ...(typeof bundleId === "string" && bundleId.trim().length > 0
                ? { bundleId }
                : {}),
        };
    });

const mapContentForStrategy = (content: CampaignContentItem[]) =>
    content.map((item) => ({
        _id: String(item._id ?? ""),
        socialMedia: String(item.socialMedia ?? ""),
        socialMediaGroup: String(item.socialMediaGroup ?? ""),
        mainLink: String(item.mainLink ?? ""),
        descriptions: (item.descriptions ?? []).map((description) => ({
            _id: String(description._id ?? ""),
            description: String(description.description ?? ""),
        })),
        taggedUser: String(item.taggedUser ?? ""),
        taggedLink: String(item.taggedLink ?? ""),
        additionalBrief: normalizeAdditionalBriefVersions(
            item.additionalBrief,
        ),
        profileType: String(item.profileType ?? "community"),
    }));

const resolveStrategySocialMedia = (items: CampaignContentItem[]) => {
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
    addedAccounts: mapAccountsForStrategy(accounts, content),
    campaignContent: mapContentForStrategy(content),
});

export const buildStrategyProposalPayload = ({
    campaignName,
    totalPrice,
    displayCurrency,
    accounts,
    content,
    selectedOfferId,
    selectedOfferAccountIds,
}: BuildStrategyProposalParams): CreateProposalCampaignRequest => {
    const offerId = selectedOfferId?.trim();

    if (selectedOfferId !== null && !offerId) {
        throw new Error("Selected Offer id is missing");
    }

    return {
        campaignName: String(campaignName ?? ""),
        socialMedia: resolveStrategySocialMedia(content),
        campaignPrice: Number(totalPrice),
        displayCurrency,
        addedAccounts: mapAccountsForCreateCampaign(accounts, content),
        campaignContent: mapContentForStrategy(content),
        ...(offerId
            ? {
                selectedOffer: {
                    offerId,
                    selectedAccountIds: selectedOfferAccountIds.map(String),
                },
            }
            : {}),
    };
};

export const assertInitialProposalCreateTopology = (
    payload: CreateProposalCampaignRequest,
) => {
    const accountIds = payload.addedAccounts.map(
        ({ socialAccountId }) => socialAccountId,
    );

    if (accountIds.some((accountId) => !accountId.trim())) {
        throw new Error("Proposal contains an account without a social account id");
    }

    const uniqueAccountIds = new Set(accountIds);

    if (uniqueAccountIds.size !== accountIds.length) {
        throw new Error("Proposal contains duplicate social accounts");
    }

    if (!payload.selectedOffer) return;

    const offerAccountIds = payload.selectedOffer.selectedAccountIds;
    const uniqueOfferAccountIds = new Set(offerAccountIds);

    if (
        offerAccountIds.length === 0 ||
        offerAccountIds.some((accountId) => !accountId.trim())
    ) {
        throw new Error("Selected Offer account membership is missing");
    }

    if (uniqueOfferAccountIds.size !== offerAccountIds.length) {
        throw new Error("Selected Offer contains duplicate social accounts");
    }

    if (offerAccountIds.some((accountId) => !uniqueAccountIds.has(accountId))) {
        throw new Error("Selected Offer accounts are missing from the Proposal");
    }
};

export const buildStrategyCreateCampaignPayload = ({
                                                       campaignName,
                                                       totalPrice,
                                                       displayCurrency,
                                                       accounts,
                                                       content,
                                                       paymentDetails,
                                                   }: BuildStrategyCreateCampaignParams): CreateRegularCampaignRequest => ({
    campaignName: String(campaignName ?? ""),
    socialMedia: resolveStrategySocialMedia(content),
    campaignPrice: Number(totalPrice ?? 0),
    displayCurrency,
    addedAccounts: mapAccountsForCreateCampaign(accounts, content),
    campaignContent: mapContentForStrategy(content),
    paymentDetails,
});

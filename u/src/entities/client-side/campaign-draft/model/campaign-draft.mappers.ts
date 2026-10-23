
import type { CampaignDraftDto, DraftAddedAccountDto } from "../api/campaign-draft.dto.ts";
import type {
    CampaignContentItem,
    CampaignDraftLatestStep, SelectedCampaignAccount
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types.ts";

export const mapDraftStepToBuilderStep = (
    step: CampaignDraftDto["step"],
): CampaignDraftLatestStep => {
    if (step === "addAccounts") return "addAccounts";
    if (step === "addContent") return "addContent";
    return "strategyTable";
};

export const mapDraftAccountToSelectedAccount = (
    account: DraftAddedAccountDto,
): SelectedCampaignAccount => ({
    selectionId: account.selectionId,
    accountId: String(account.socialAccountId),
    influencerId: String(account.influencerId),
    socialMedia: String(account.socialMedia),
    username: String(account.username),
    price: account.prices?.EUR ?? 0,
    priceCurrency: "EUR",
    prices: account.prices,
    source: account.source === "offer" ? "offer" : account.source === "bundle" ? "bundle" : "manual",
    profileType: account.profileType,
    followers: Number(account.followers),
    dateRequest: account.dateRequest ?? "ASAP",
    selectedCampaignContentItem: account.selectedCampaignContentItem
        ? {
            campaignContentItemId: String(
                account.selectedCampaignContentItem.campaignContentItemId,
            ),
            descriptionId: account.selectedCampaignContentItem.descriptionId,
            additionalBriefId:
                account.selectedCampaignContentItem.additionalBriefId,
        }
        : undefined,
});

export const mapDraftContentToCampaignContent = (
    items: CampaignDraftDto["campaignContent"] = [],
): CampaignContentItem[] =>
    items.map((item) => ({
        _id: String(item._id),
        socialMedia: String(item.socialMedia),
        socialMediaGroup: item.socialMediaGroup,
        mainLink: String(item.mainLink ?? ""),
        descriptions: (item.descriptions ?? []).map((description) => ({
            _id: String(description._id),
            description: String(description.description ?? ""),
        })),
        profileType: item.profileType,
        taggedUser: String(item.taggedUser ?? ""),
        taggedLink: String(item.taggedLink ?? ""),
        additionalBrief: item.additionalBrief ?? [],
        accountId: item.accountId ? String(item.accountId) : undefined,
    }));


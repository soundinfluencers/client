
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
    accountId: String(account.socialAccountId),
    influencerId: String(account.influencerId),
    socialMedia: String(account.socialMedia),
    username: String(account.username),
    price: Number(account.price),
    profileType: account.profileType,
    followers: Number(account.followers),
    dateRequest: account.dateRequest ?? "ASAP",
    selectedCampaignContentItem: account.selectedCampaignContentItem
        ? {
            campaignContentItemId: String(
                account.selectedCampaignContentItem.campaignContentItemId,
            ),
            descriptionId: String(
                account.selectedCampaignContentItem.descriptionId,
            ),
            additionalBriefId:
                account.selectedCampaignContentItem.additionalBriefId
                    ? String(account.selectedCampaignContentItem.additionalBriefId)
                    : undefined,
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
        additionalBrief: Array.isArray(item.additionalBrief)
            ? String(item.additionalBrief[0]?.additionalBrief ?? "")
            : String(item.additionalBrief ?? ""),
        accountId: item.accountId ? String(item.accountId) : undefined,
    }));


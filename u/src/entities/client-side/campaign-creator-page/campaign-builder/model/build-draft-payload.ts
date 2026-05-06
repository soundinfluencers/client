import type {
    CampaignBuilderState,
    CampaignDraftLatestStep,
} from "../model/campaign-builder.types";

type DraftPayloadOverrides = {
    campaignName?: string;
    draftId?: string | null;
    campaignContent?: CampaignBuilderState["campaignContent"];
};

export const resolveDraftSocialMedia = (
    state: CampaignBuilderState,
): string => {
    const firstFromContent = state.campaignContent?.[0]?.socialMedia;
    const firstFromAccounts = state.selectedAccounts?.[0]?.socialMedia;

    return String(
        firstFromContent ||
        firstFromAccounts ||
        "instagram",
    ).toLowerCase();
};

export const mapDraftAddedAccounts = (
    state: CampaignBuilderState,
    fallbackSocialMedia: string,
) => {
    const map = new Map<string, unknown>();

    state.selectedAccounts.forEach((item) => {
        const socialAccountId = String(item.accountId ?? "");
        if (!socialAccountId) return;

        map.set(socialAccountId, {
            influencerId: String(item.influencerId ?? ""),
            socialAccountId,
            socialMedia: String(
                item.socialMedia || fallbackSocialMedia,
            ).toLowerCase(),
            username: String(item.username ?? ""),
            logoUrl: item.logoUrl ?? "",
            followers: item.followers ?? 0,
            price: item.price ?? 0,
            dateRequest: item.dateRequest ?? "ASAP",
            selectedCampaignContentItem: item.selectedCampaignContentItem,
        });
    });

    return Array.from(map.values());
};

export const buildCampaignDraftPayload = (
    state: CampaignBuilderState,
    step: CampaignDraftLatestStep,
    overrides?: DraftPayloadOverrides,
) => {
    const draftSocialMedia = resolveDraftSocialMedia(state);

    const payload: Record<string, unknown> = {
        campaignName: overrides?.campaignName ?? state.campaignName ?? "",
        socialMedia: draftSocialMedia,
        step,
        addedAccounts: mapDraftAddedAccounts(state, draftSocialMedia),

        selectedOfferId: state.selectedOfferId,
        selectedOfferAccountIds: state.selectedOfferAccountIds,
    };

    if (step === "addContent" || step === "strategyTable") {
        payload.campaignContent =
            overrides?.campaignContent ?? state.campaignContent ?? [];
    }

    if ((overrides?.draftId ?? state.draftId) != null) {
        payload.draftId = overrides?.draftId ?? state.draftId;
    }
    console.log("SAVE STATE", {

        selectedOfferId: state.selectedOfferId,

        selectedOfferAccountIds: state.selectedOfferAccountIds,

        selectedPromoCardIds: state.selectedPromoCardIds,

        selectedAccounts: state.selectedAccounts,

    });
    return payload;
};

export const hasDraftSelection = (state: CampaignBuilderState) => {
    return Boolean(
        state.selectedOfferId ||
        state.selectedAccounts.length,
    );
};
import { reconcileDraftSelectionRows, reconcileDraftWorkflow } from "./draft-occurrences";
import type {
    CampaignBuilderState,
    CampaignDraftLatestStep,
} from "../model/campaign-builder.types";
import { currencyCode, getBuilderSelectedOffer, serializeDraftSelection } from "./selected-offer";
import { serializeCampaignContent, serializeContentReference } from "./campaign-content.transport";

type DraftPayloadOverrides = {
    workflowRows?: Parameters<typeof reconcileDraftWorkflow>[1];
    campaignName?: string;
    draftId?: string | null;
    campaignContent?: CampaignBuilderState["campaignContent"];
};

export const resolveDraftSocialMedia = (
    state: CampaignBuilderState,
): string => {
    const socials = [...new Set(state.selectedAccounts.map((a) => a.socialMedia.toLowerCase()))];
    if (socials.length > 1) return "multipromo";
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
    const occurrences = reconcileDraftSelectionRows(state.selectedAccounts, getBuilderSelectedOffer(state));
    return state.selectedAccounts.map((item, index) => {
        const socialAccountId = String(item.accountId ?? "");
        return {
            ...occurrences[index],
            influencerId: String(item.influencerId ?? ""),
            socialAccountId,
            socialMedia: String(
                item.socialMedia || fallbackSocialMedia,
            ).toLowerCase(),
            username: String(item.username ?? ""),
            logoUrl: item.logoUrl ?? "",
            followers: item.followers ?? 0,
            profileType: item.profileType,
            dateRequest: item.dateRequest ?? "ASAP",
            selectedCampaignContentItem: item.selectedCampaignContentItem,
        };
    }).filter((item) => item.socialAccountId);
};

export const buildCampaignDraftPayload = (
    state: CampaignBuilderState,
    step: CampaignDraftLatestStep,
    overrides?: DraftPayloadOverrides,
) => {
    if (state.selectedOfferIsAvailable === false || state.selectedAccounts.some((a) => a.isAvailable === false)) throw new Error("Saved selections are unavailable or have changed. Review the catalogue before saving this Draft.");
    if (overrides?.workflowRows) state = { ...state, selectedAccounts: reconcileDraftWorkflow(state.selectedAccounts, overrides.workflowRows) };
    const draftSocialMedia = resolveDraftSocialMedia(state);

    const payload: Record<string, unknown> = {
        campaignName: overrides?.campaignName ?? state.campaignName ?? "",
        socialMedia: draftSocialMedia,
        step,
        displayCurrency: currencyCode(state.selectedCurrency),
        ...serializeDraftSelection(mapDraftAddedAccounts(state, draftSocialMedia), getBuilderSelectedOffer(state)),
    };

    if (step === "addContent" || step === "strategyTable") {
        const campaignContent = serializeCampaignContent(overrides?.campaignContent ?? state.campaignContent ?? []);
        payload.campaignContent = campaignContent;
        payload.addedAccounts = (payload.addedAccounts as ReturnType<typeof mapDraftAddedAccounts>).map((row) => ({
            ...row, selectedCampaignContentItem: serializeContentReference(row.selectedCampaignContentItem, campaignContent),
        }));
    }

    if ((overrides?.draftId ?? state.draftId) != null) {
        payload.draftId = overrides?.draftId ?? state.draftId;
    }
    return payload;
};

export const hasDraftSelection = (state: CampaignBuilderState) => {
    return Boolean(
        state.selectedOfferId ||
        state.selectedAccounts.length,
    );
};

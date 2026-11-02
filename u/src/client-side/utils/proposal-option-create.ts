import { serializeCampaignContent, serializeContentReference } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-content.transport";
import { assertSupportedSelections, serializeSelectedOffer, getBuilderSelectedOffer } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";
import { buildStrategyProposalPayload } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload";
import { offerRowIds, type ProposalOptionSnapshot } from "./proposal-option-patch";
import type { CampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";

export const OPTION_CREATE_MODE = "proposal-option-create";
export const optionCreateContext = (params: URLSearchParams) => {
    if (params.get("mode") !== OPTION_CREATE_MODE) return null;
    const campaignId = params.get("campaignId")?.trim();
    const sourceOption = Number(params.get("sourceOption"));
    if (!campaignId || !params.has("sourceOption") || !Number.isInteger(sourceOption) || sourceOption < 0) throw new Error("Proposal option creation context is invalid.");
    return { campaignId, sourceOption };
};

export const assertOptionCreateBody = (body: any) => {
    if (!["EUR", "USD", "GBP"].includes(body.displayCurrency) || !Number.isSafeInteger(body.campaignPrice) || body.campaignPrice < 0 || !body.campaignName?.trim() ||
        !body.addedAccounts?.length || !body.campaignContent?.length) throw new Error("A new option requires a valid currency, price, accounts and content.");
    const ids = body.addedAccounts.map((a: any) => a.socialAccountId);
    if (new Set(ids).size !== ids.length) throw new Error("Review ambiguous accounts before creating an option.");
    for (const row of body.addedAccounts) {
        if (!row.socialAccountId || !row.influencerId || !row.socialMedia || !row.selectedCampaignContentItem?.campaignContentItemId) throw new Error("Select content for every account before creating the option.");
    }
    return body;
};

export const buildCloneProposalOption = (campaignName: string, socialMedia: string, snapshot?: ProposalOptionSnapshot) => {
    if (!snapshot?.canEdit) throw new Error("The source option is unavailable for editing.");
    assertSupportedSelections(snapshot.addedAccounts, Boolean(snapshot.addedBundles?.length || snapshot.addedAccounts.some((a) => a.campaignBundleId)));
    offerRowIds(snapshot);
    const campaignContent = serializeCampaignContent(snapshot.campaignContent);
    const addedAccounts = snapshot.addedAccounts.map((a) => ({
        socialAccountId: a.socialAccountId, influencerId: a.influencerId, socialMedia: a.socialMedia,
        username: a.username ?? "", dateRequest: a.dateRequest ?? "ASAP",
        selectedCampaignContentItem: serializeContentReference(Object.hasOwn(a, "selectedCampaignContentItem") ? a.selectedCampaignContentItem : a.selectedContent, campaignContent),
    }));
    return assertOptionCreateBody({ campaignName, socialMedia, displayCurrency: snapshot.displayCurrency, campaignPrice: snapshot.price,
        campaignContent, addedAccounts, selectedOffer: serializeSelectedOffer(snapshot.selectedOffer ? { offerId: snapshot.selectedOffer.offerId, selectedAccountIds: snapshot.selectedOffer.selectedAccountIds } : null, addedAccounts) });
};

export const buildBuilderProposalOption = (state: CampaignBuilderStore) => {
    if (!state.totalPriceReady) throw new Error("Prices are unavailable for the selected currency.");
    assertSupportedSelections(state.selectedAccounts, state.unsupportedDraftBundles || Boolean(state.selectedBundles.length) || state.selectedAccounts.some((a: any) => a.campaignBundleId));
    serializeSelectedOffer(getBuilderSelectedOffer(state), state.selectedAccounts.map((a) => ({ ...a, socialAccountId: a.accountId })), state.selectedOfferIsAvailable);
    return assertOptionCreateBody(buildStrategyProposalPayload({ campaignName: state.campaignName, totalPrice: state.totalPrice,
        displayCurrency: state.selectedCurrency, accounts: state.selectedAccounts, content: state.campaignContent, selectedOffer: getBuilderSelectedOffer(state) }));
};

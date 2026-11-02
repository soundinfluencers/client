import type { ApproveProposalCampaignBody } from "@/api/client/campaign/campaign.api";
import { proposalApprovalPayment } from "./proposal-checkout";
import type { CampaignPaymentDetails, CreateRegularCampaignRequest } from "@/api/client/campaign/create-campaign.types";
import { serializeSelectedOffer } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";

export type CheckoutContext =
    | { kind: "builder"; draftId: string | null }
    | { kind: "draft"; draftId: string }
    | { kind: "proposal"; proposalId: string; optionIndex: number }
    | { kind: "invalid"; message: string };

export const resolveCheckoutContext = (pathname: string, params: URLSearchParams, builderDraftId: string | null): CheckoutContext => {
    const draftId = params.get("draft");
    const proposalId = params.get("proposal");
    if ((params.has("draft") && params.has("proposal")) ||
        (params.has("draft") && !draftId?.trim()) || (params.has("proposal") && !proposalId?.trim())) {
        return { kind: "invalid", message: "Invalid checkout link. Please reopen your campaign." };
    }
    if (pathname.replace(/\/$/, "") === "/client/create-campaign/content/strategy/payment") {
        return draftId || proposalId
            ? { kind: "invalid", message: "Invalid builder checkout link." }
            : { kind: "builder", draftId: builderDraftId };
    }
    if (draftId) return { kind: "draft", draftId };
    if (proposalId) {
        const rawOption = params.get("option");
        const optionIndex = Number(rawOption);
        return /^[a-f0-9]{24}$/i.test(proposalId) && params.getAll("proposal").length === 1 &&
            params.getAll("option").length === 1 && /^(0|[1-9]\d*)$/.test(rawOption ?? "") && Number.isSafeInteger(optionIndex)
            ? { kind: "proposal", proposalId, optionIndex }
            : { kind: "invalid", message: "Invalid proposal option." };
    }
    return { kind: "invalid", message: "Please open your campaign before proceeding to payment." };
};

// Keep endpoint selection and cleanup tied to the same context. A failed POST never deletes a draft.
export const submitCheckout = async ({ context, base, paymentDetails, offerIsAvailable, postCampaign,
    approveProposal, deleteDraft, clearDraft, onCreated }: {
    context: CheckoutContext;
    base: Omit<CreateRegularCampaignRequest, "paymentDetails">;
    paymentDetails: CampaignPaymentDetails;
    offerIsAvailable?: boolean | null;
    postCampaign: (payload: CreateRegularCampaignRequest) => Promise<unknown>;
    approveProposal: (id: string, option: number, payment: ApproveProposalCampaignBody) => Promise<unknown>;
    deleteDraft: (id: string) => Promise<unknown>;
    clearDraft: (id: string) => void;
    onCreated?: () => void;
}): Promise<{ cleanupError?: unknown }> => {
    if (context.kind === "invalid") throw new Error(context.message);
    if (context.kind === "proposal") {
        await approveProposal(context.proposalId, context.optionIndex, proposalApprovalPayment(paymentDetails));
        return {};
    }
    if (!Number.isSafeInteger(base.campaignPrice) || base.campaignPrice < 0) {
        throw new Error("Campaign display amount must be a non-negative whole number.");
    }
    // Explicit allowlist: enriched GET data and selectedOfferSnapshot cannot leak through a spread.
    await postCampaign({
        campaignName: base.campaignName,
        socialMedia: base.socialMedia,
        campaignPrice: base.campaignPrice,
        displayCurrency: base.displayCurrency ?? "EUR",
        addedAccounts: base.addedAccounts.map((row) => ({
            socialAccountId: row.socialAccountId, influencerId: row.influencerId,
            socialMedia: row.socialMedia, username: row.username,
            selectedCampaignContentItem: row.selectedCampaignContentItem,
            dateRequest: row.dateRequest,
            ...(row.bundleId ? { bundleId: row.bundleId } : {}),
        })),
        campaignContent: base.campaignContent,
        selectedOffer: serializeSelectedOffer(base.selectedOffer, base.addedAccounts, offerIsAvailable),
        paymentDetails,
    });
    // HTTP creation is complete. Lock this checkout before starting best-effort cleanup.
    onCreated?.();
    if (context.draftId) {
        try {
            await deleteDraft(context.draftId);
            clearDraft(context.draftId);
        } catch (cleanupError) {
            return { cleanupError };
        }
    }
    return {};
};

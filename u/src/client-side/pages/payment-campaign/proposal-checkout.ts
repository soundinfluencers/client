import type { ApproveProposalCampaignBody } from "@/api/client/campaign/campaign.api";
import { BUNDLES_AVAILABLE } from "@/shared/config/bundle-availability";

export const proposalPaymentPath = (id: unknown, index: unknown): string | null =>
    typeof id === "string" && /^[a-f0-9]{24}$/i.test(id) &&
    typeof index === "number" && Number.isSafeInteger(index) && index >= 0
        ? `/client/campaign/payment?${new URLSearchParams({ proposal: id, option: String(index) })}` : null;

export type SavedProposalCheckout = {
    campaignId: string;
    campaignName: string;
    selectedOption: {
        optionIndex: number;
        price: number;
        displayCurrency: "EUR" | "USD" | "GBP";
        addedAccounts: Record<string, any>[];
        campaignContent: Record<string, any>[];
        selectedOffer?: Record<string, any> | null;
        addedBundles?: unknown[];
        [key: string]: any;
    };
};

// Axios + ResponseTransformInterceptor. Do not read private stores or flattened refs here.
export const readProposalCheckout = (response: any, id: string, index: number): SavedProposalCheckout => {
    const saved = response?.data?.data;
    const option = saved?.selectedOption;
    if (saved?.campaignId !== id || option?.optionIndex !== index ||
        typeof option?.price !== "number" || !Number.isSafeInteger(option.price) || option.price < 0 ||
        !["EUR", "USD", "GBP"].includes(option.displayCurrency) ||
        !Array.isArray(option.addedAccounts) || !option.addedAccounts.length || !Array.isArray(option.campaignContent)) {
        throw new Error("The saved Proposal option could not be verified. Reopen its link or retry reading.");
    }
    if (!BUNDLES_AVAILABLE && (option.addedBundles?.length || option.addedAccounts.some((row: any) =>
        row.bundleId || row.campaignBundleId || row.source === "bundle"))) {
        throw new Error("Bundle Proposal checkout is unavailable. No approval was sent.");
    }
    // Preserve authoritative Offer identity and lifecycle membership, including overlap metadata.
    return saved;
};

// Compare saved approval data, not canEdit or transient catalogue metrics/logo enrichment.
export const proposalCheckoutFingerprint = (saved: SavedProposalCheckout): string => {
    const option = saved.selectedOption;
    return JSON.stringify({ name: saved.campaignName, price: option.price, currency: option.displayCurrency,
        offer: option.selectedOffer ?? null, bundles: option.addedBundles ?? [], content: option.campaignContent,
        accounts: option.addedAccounts.map((row) => ({ id: row.addedAccountsId, account: row.socialAccountId,
            influencer: row.influencerId, social: row.socialMedia, date: row.dateRequest,
            content: row.selectedContent, bundle: row.campaignBundleId, bundleId: row.bundleId })) });
};

export const proposalApprovalPayment = (body: ApproveProposalCampaignBody): ApproveProposalCampaignBody => ({
    firstName: body.firstName, lastName: body.lastName, address: body.address, country: body.country,
    referenceNumber: body.referenceNumber, selectedPaymentMethod: body.selectedPaymentMethod,
    ...(body.company !== undefined ? { company: body.company } : {}),
    ...(body.vatNumber !== undefined ? { vatNumber: body.vatNumber } : {}),
    ...(body.poNumber !== undefined ? { poNumber: body.poNumber } : {}),
});

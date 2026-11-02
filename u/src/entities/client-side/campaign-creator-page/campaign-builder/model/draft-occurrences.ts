import type { SelectedCampaignAccount } from "./campaign-builder.types";
import type { SelectedOffer } from "./selected-offer";

export type DraftSelectionRow = {
    selectionId: string;
    source: "standalone" | "offer" | "bundle";
    socialAccountId: string;
    influencerId: string;
    socialMedia: string;
    offerId?: string;
    bundleId?: string;
};

// Runtime already has one row per saved occurrence. Reconcile by its stable identity,
// never by accountId or source+accountId, and never use a GET subdocument _id.
export const reconcileDraftSelectionRows = (
    accounts: readonly SelectedCampaignAccount[], selection: SelectedOffer | null,
): DraftSelectionRow[] => {
    const used = new Set<string>();
    const rows = accounts.map((a): DraftSelectionRow => {
        if (!a.selectionId || !/^[a-f0-9]{24}$/i.test(a.selectionId) || used.has(a.selectionId)) {
            throw new Error("Draft occurrences need unique stable selectionId values. Review the saved selections.");
        }
        used.add(a.selectionId);
        if (!a.accountId || !a.influencerId || !a.socialMedia) throw new Error("Draft account identity is incomplete.");
        const source = a.source === "bundle" ? "bundle" : a.source === "offer" || (!a.source && selection?.selectedAccountIds.includes(a.accountId)) ? "offer" : "standalone";
        if (source === "bundle" && !a.bundleId) throw new Error("Draft Bundle membership is incomplete.");
        if (source === "offer" && (!selection || !selection.selectedAccountIds.includes(a.accountId))) throw new Error("Draft Offer membership is incomplete.");
        // Shared Offer+Bundle runtime coverage needs explicit transport occurrences first.
        if (source !== "bundle" && a.bundleId) throw new Error("Review the separate Offer and Bundle occurrences before saving.");
        return { selectionId: a.selectionId, source, socialAccountId: a.accountId, influencerId: a.influencerId,
            socialMedia: a.socialMedia.toLowerCase(), ...(source === "offer" ? { offerId: selection!.offerId } : {}),
            ...(source === "bundle" ? { bundleId: a.bundleId } : {}) };
    });
    if (selection) {
        const ids = selection.selectedAccountIds;
        if (!selection.offerId || !ids.length || new Set(ids).size !== ids.length ||
            ids.some((id) => !rows.some((r) => r.source === "offer" && r.socialAccountId === id))) {
            throw new Error("Saved Offer membership is incomplete. Review the selection.");
        }
    }
    return rows;
};

// Form workflow is subordinate to the current composition. Missing/stale form rows
// cannot remove or resurrect occurrences, and account-only matches must be unambiguous.
export const reconcileDraftWorkflow = (accounts: readonly SelectedCampaignAccount[], formRows: readonly {
    selectionId?: string; socialAccountId: string; dateRequest?: string;
    selectedCampaignContentItem?: SelectedCampaignAccount["selectedCampaignContentItem"];
}[]): SelectedCampaignAccount[] => accounts.map((account) => {
    const matches = formRows.filter((r) => r.selectionId ? r.selectionId === account.selectionId :
        r.socialAccountId === account.accountId && accounts.filter((a) => a.accountId === account.accountId).length === 1);
    if (matches.length > 1) throw new Error("Ambiguous content workflow for a Draft occurrence. Review the saved selections.");
    const row = matches[0];
    return !row ? account : { ...account,
        ...(row.dateRequest !== undefined ? { dateRequest: row.dateRequest } : {}),
        ...(Object.hasOwn(row, "selectedCampaignContentItem") ? { selectedCampaignContentItem: row.selectedCampaignContentItem } : {}),
    };
});

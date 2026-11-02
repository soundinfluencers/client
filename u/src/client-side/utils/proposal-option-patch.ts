import { serializeCampaignContent, serializeContentReference } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-content.transport";

export type ProposalOptionSnapshot = {
    optionIndex: number; canEdit: boolean; price: number; displayCurrency: string;
    pricesByCurrency?: Record<string, number>;
    addedAccounts: any[]; campaignContent: any[]; addedBundles?: any[]; selectedOffer?: any;
};
// Runtime identity for a reconciled new placement; never a lifecycle ID or a transport field.
export const getProposalWorkingRowKey = (row: any): string => row.addedAccountsId ? String(row.addedAccountsId)
    : row.isNewProposalPlacement === true && row.selectionId ? `selection:${row.selectionId}` : "";

export const offerRowIds = (snapshot: ProposalOptionSnapshot): Set<string> => {
    const offer = snapshot.selectedOffer;
    if (!offer) return new Set();
    const ids: string[] = offer.selectedAddedAccountsIds ?? [];
    if (!ids.length || new Set(ids).size !== ids.length || !offer.selectedAccountIds?.length) throw new Error("Authoritative Offer row membership is incomplete. Reload the option.");
    const rows = ids.map((id) => snapshot.addedAccounts.find((a) => a.addedAccountsId === id));
    if (rows.some((a) => !a) || rows.length !== offer.selectedAccountIds.length ||
        new Set(offer.selectedAccountIds).size !== offer.selectedAccountIds.length || offer.selectedAccountIds.some((id: string) => rows.filter((a) => a.socialAccountId === id).length !== 1)) throw new Error("Authoritative Offer membership is inconsistent.");
    return new Set(ids);
};

// Explicit omission/null/replacement. Snapshot identities belong to existing placements,
// never to Draft occurrences or social accounts. No local topology price is submitted.
export const buildProposalOptionPatchBody = ({ snapshot, accounts, content, patches = {}, selectedOfferChange, campaignName }: {
    snapshot?: ProposalOptionSnapshot; accounts: any[]; content: any[]; patches?: Record<string, any>;
    selectedOfferChange?: any; campaignName?: string;
}) => {
    if (!snapshot || !snapshot.canEdit) throw new Error("This option is unavailable for editing. Reload it before saving.");
    const ids = snapshot.addedAccounts.map((a) => a.addedAccountsId);
    if (ids.some((id) => !id) || new Set(ids).size !== ids.length) throw new Error("Existing Proposal placement identities are missing or ambiguous.");
    const offerIds = offerRowIds(snapshot);
    const seen = new Set();
    const campaignContent = serializeCampaignContent(content.map((c) => ({ ...c, ...(patches[c._id] ?? {}) })));
    const addedAccounts = accounts.map((a) => {
        if (a.addedAccountsId && seen.has(a.addedAccountsId)) throw new Error("Existing placements must retain unique addedAccountsId values.");
        if (a.addedAccountsId) seen.add(a.addedAccountsId);
        const previous = snapshot.addedAccounts.find((r) => r.addedAccountsId === a.addedAccountsId);
        // Add Influencer marks only new, reconciled local occurrences. The marker is never transported.
        // A surviving occurrence with a lost lifecycle ID remains invalid.
        if ((!previous && (a.addedAccountsId || (!a.isNewProposalPlacement && snapshot.addedAccounts.some((r) => r.socialAccountId === a.socialAccountId)))) || (previous && (previous.socialAccountId !== a.socialAccountId || previous.influencerId !== a.influencerId || previous.socialMedia !== a.socialMedia)) || !a.socialAccountId || !a.influencerId || !a.socialMedia) throw new Error("A placement cannot be matched to its authoritative identity.");
        const ref = Object.hasOwn(a, "selectedCampaignContentItem") ? a.selectedCampaignContentItem : a.selectedContent;
        return { ...(a.addedAccountsId ? { addedAccountsId: a.addedAccountsId } : {}), socialAccountId: a.socialAccountId, influencerId: a.influencerId,
            socialMedia: a.socialMedia, username: a.username ?? "", dateRequest: a.dateRequest ?? "ASAP",
            ...(a.bundleId ? { bundleId: a.bundleId } : {}),
            selectedCampaignContentItem: serializeContentReference(ref, campaignContent),
        };
    });
    if (selectedOfferChange === undefined && [...offerIds].some((id) => !seen.has(id))) throw new Error("Remove the complete Offer explicitly before saving.");
    if (selectedOfferChange) {
        const members = selectedOfferChange.selectedAccountIds;
        if (!selectedOfferChange.offerId || !Array.isArray(members) || !members.length || new Set(members).size !== members.length ||
            members.some((id: string) => addedAccounts.filter((a) => a.socialAccountId === id).length !== 1)) throw new Error("The replacement Offer needs complete unambiguous membership.");
        const rowIds = selectedOfferChange.selectedAddedAccountsIds;
        if (rowIds && (rowIds.length !== members.length || new Set(rowIds).size !== rowIds.length || rowIds.some((id: string) => !seen.has(id) || !members.includes(addedAccounts.find((a) => a.addedAccountsId === id)?.socialAccountId)))) throw new Error("Replacement Offer lifecycle membership is inconsistent.");
    }
    for (const row of snapshot.addedAccounts) {
        if ((row.bundleId || row.campaignBundleId) && !(snapshot.addedBundles ?? []).some((b) => b.campaignBundleId === row.campaignBundleId && b.bundleId === row.bundleId)) throw new Error("Bundle row cannot be joined to its authoritative snapshot.");
    }
    for (const bundle of snapshot.addedBundles ?? []) {
        const before = snapshot.addedAccounts.filter((a) => a.campaignBundleId === bundle.campaignBundleId);
        if (!before.length || before.some((a) => a.bundleId !== bundle.bundleId)) throw new Error("Authoritative Bundle membership is inconsistent.");
        const remaining = accounts.filter((a) => a.campaignBundleId === bundle.campaignBundleId && a.bundleId === bundle.bundleId);
        if (remaining.length && remaining.length !== before.length) throw new Error("A Bundle cannot be saved partially.");
        if (!remaining.length && before.some((a) => seen.has(a.addedAccountsId) &&
            (selectedOfferChange === null || !offerIds.has(a.addedAccountsId)))) throw new Error("Removing a Bundle cannot turn its members into standalone placements.");
    }
    return { campaignName: campaignName ?? "", addedAccounts, campaignContent,
        ...(selectedOfferChange !== undefined ? { selectedOffer: selectedOfferChange } : {}) };
};

// Pure internal group operation; callers enforce permission, last-option policy and Bundle gate.
export const removeProposalGroup = (snapshot: ProposalOptionSnapshot, accounts: any[], targetId: string, removeOverlap = false, workingOffer = false) => {
    const target = accounts.find((a) => getProposalWorkingRowKey(a) === targetId);
    if (!target) throw new Error("Placement is no longer present.");
    let offerIds: Set<string>;
    if (workingOffer && snapshot.selectedOffer) {
        const selection = serializeWorkingOffer(snapshot.selectedOffer, accounts);
        offerIds = new Set(selection.map(getProposalWorkingRowKey));
    } else offerIds = offerRowIds(snapshot);
    const bundle = target.campaignBundleId;
    const removesOffer = removeOverlap || (!bundle && offerIds.has(targetId));
    const next = accounts.flatMap((a) => {
        const inBundle = bundle && a.campaignBundleId === bundle;
        if (removeOverlap && (inBundle || offerIds.has(getProposalWorkingRowKey(a)))) return [];
        if (bundle && inBundle) {
            if (!offerIds.has(getProposalWorkingRowKey(a))) return [];
            const { bundleId, campaignBundleId, bundlePosition, ...retained } = a;
            return [retained];
        }
        if (removesOffer && offerIds.has(getProposalWorkingRowKey(a)) && !a.campaignBundleId) return [];
        if (!bundle && !removesOffer && getProposalWorkingRowKey(a) === targetId) return [];
        return [a];
    });
    return { accounts: next, ...(removesOffer ? { selectedOfferChange: null } : {}) };
};
const serializeWorkingOffer = (offer: any, accounts: any[]): any[] => {
    const members: string[] = offer.selectedAccountIds ?? [];
    if (!offer.offerId || !members.length || new Set(members).size !== members.length) throw new Error("Working Offer membership is incomplete.");
    const rows = members.map((id) => accounts.filter((a) => a.socialAccountId === id));
    if (rows.some((matches) => matches.length !== 1 || !getProposalWorkingRowKey(matches[0]))) throw new Error("Working Offer placements are ambiguous. No rows were removed.");
    return rows.flat();
};

export const proposalOptionDirty = (snapshot: ProposalOptionSnapshot | undefined, accounts: any[], content: any[], patches: Record<string, any>, change?: any) => {
    if (!snapshot) return true;
    const rows = (items: any[]) => items.map((a) => ({ addedAccountsId: a.addedAccountsId, socialAccountId: a.socialAccountId,
        bundleId: a.bundleId, campaignBundleId: a.campaignBundleId, dateRequest: a.dateRequest ?? "ASAP",
        selected: Object.hasOwn(a, "selectedCampaignContentItem") ? a.selectedCampaignContentItem : a.selectedContent,
    })).sort((a, b) => String(a.addedAccountsId).localeCompare(String(b.addedAccountsId)));
    try {
        return (change !== undefined && JSON.stringify(change) !== JSON.stringify(snapshot.selectedOffer ?? null)) ||
            JSON.stringify(rows(accounts)) !== JSON.stringify(rows(snapshot.addedAccounts)) ||
            JSON.stringify(serializeCampaignContent(content.map((c) => ({ ...c, ...(patches[c._id] ?? {}) })))) !== JSON.stringify(serializeCampaignContent(snapshot.campaignContent));
    } catch { return true; }
};

// The shared patch map belongs to one editor, not to every option with matching content IDs.
export const proposalEditorPatches = (patches: Record<string, any>, optionIndex: number, editorIndex: number): Record<string, any> =>
    optionIndex === editorIndex ? patches : {};

export const dirtyProposalOptions = (state: any, patches: Record<string, any>, activeOption: number): number[] => {
    const indexes = [...new Set<number>([...Object.keys(state.optionSnapshotsByIndex), ...Object.keys(state.accountsByOption),
        ...Object.keys(state.contentByOption), ...Object.keys(state.selectedOfferChangeByOption)].map(Number))];
    const ownedContent = new Set<string>();
    const dirty = indexes.filter((index) => {
        const contentIds = new Set<string>([...(state.contentByOption[index] ?? []), ...(state.optionSnapshotsByIndex[index]?.campaignContent ?? [])].map((c: any) => c._id));
        if (index === activeOption) contentIds.forEach((id) => ownedContent.add(id));
        const localPatches = Object.fromEntries(Object.entries(proposalEditorPatches(patches, index, activeOption)).filter(([id]) => contentIds.has(id)));
        return proposalOptionDirty(state.optionSnapshotsByIndex[index], state.accountsByOption[index] ?? [], state.contentByOption[index] ?? [], localPatches, state.selectedOfferChangeByOption[index]);
    });
    if (Object.keys(patches).some((id) => !ownedContent.has(id)) && !dirty.includes(activeOption)) dirty.push(activeOption);
    return dirty.sort((a, b) => a - b);
};

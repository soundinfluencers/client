import { ObjectId } from "bson";
import { assertSupportedSelections, currencySymbol, serializeSelectedOffer } from "./selected-offer";
import { serializeCampaignContent, serializeContentReference } from "./campaign-content.transport";
import { buildProposalOptionPatchBody } from "@/client-side/utils/proposal-option-patch";
import type { CampaignBuilderStore } from "./campaign-builder.types";

export type ProposalAddSession = {
    campaignId: string; optionIndex: number; sessionId: string; currency: string;
    baseline: string; requestKey: string; requestVersion: number; completed: boolean;
    placements: Array<{ selectionId?: string; addedAccountsId?: string; accountId: string; influencerId: string; socialMedia: string }>;
};
export const proposalAddContext = (params: URLSearchParams) => {
    if (params.get("mode") !== "add-influencer") return null;
    const campaignId = params.get("campaignId")?.trim(), option = params.get("option");
    if (!campaignId || !option || !/^(0|[1-9]\d*)$/.test(option) || !Number.isSafeInteger(Number(option))) throw new Error("Add Influencer requires a valid campaign and option. Open it from the Proposal.");
    return { campaignId, optionIndex: Number(option), sessionId: params.get("session") ?? "" };
};
export const proposalAddUrl = (context: { campaignId: string; optionIndex: number; sessionId: string }, currency: string, path = "/client/create-campaign", catalogue?: { platform: string; genre: string } | null) =>
    `${path}?${new URLSearchParams({ mode: "add-influencer", campaignId: context.campaignId, option: String(context.optionIndex), session: context.sessionId, currency,
        ...(catalogue?.platform ? { platform: catalogue.platform } : {}), ...(catalogue?.genre ? { genre: catalogue.genre } : {}) })}`;
export const proposalWorkingFingerprint = (state: any, index: number) => JSON.stringify({ snapshot: state.optionSnapshotsByIndex[index],
    accounts: state.accountsByOption[index], content: state.contentByOption[index], change: state.selectedOfferChangeByOption[index], preview: state.offerPreviewByOption?.[index] });
export const effectiveProposalOffer = (state: any, index: number) => Object.hasOwn(state.selectedOfferChangeByOption, index)
    ? state.selectedOfferChangeByOption[index] : state.optionSnapshotsByIndex[index]?.selectedOffer ?? null;
export const assertProposalAddSource = (snapshot: any, accounts: any[]) => {
    if (!snapshot?.canEdit || !["EUR", "USD", "GBP"].includes(snapshot.displayCurrency)) throw new Error("This Proposal option is unavailable for editing.");
    assertSupportedSelections(accounts, Boolean(snapshot.addedBundles?.length || accounts.some((a) => a.campaignBundleId)));
    const ids = accounts.map((a) => a.socialAccountId);
    if (ids.some((id) => !id) || new Set(ids).size !== ids.length) throw new Error("This option has ambiguous account placements. Their data is preserved; review the separate placements before using Campaign Builder.");
};

// Saved membership and workflow are authoritative. Catalogue data supplies presentation/prices only.
export const prepareProposalAddInfluencerBuilder = (state: any, index: number, campaignName: string, metadata: any = {}) => {
    const snapshot = state.optionSnapshotsByIndex[index], accounts = state.accountsByOption[index] ?? [], content = state.contentByOption[index] ?? [];
    assertProposalAddSource(snapshot, accounts);
    buildProposalOptionPatchBody({ snapshot, accounts, content, selectedOfferChange: state.selectedOfferChangeByOption[index] });
    const offer = effectiveProposalOffer(state, index), currency = snapshot.displayCurrency;
    const members: string[] = offer?.selectedAccountIds ?? [];
    serializeSelectedOffer(offer, accounts);
    const preview = metadata.offer ?? state.offerPreviewByOption?.[index] ?? (snapshot.selectedOffer?.offerId === offer?.offerId ? snapshot.selectedOffer : null);
    const offerPrices = preview?.prices ?? (preview?.currency && typeof preview.clientPrice === "number" ? { [preview.currency]: preview.clientPrice } : {});
    const selectedAccounts = accounts.map((row: any) => {
        const enriched = metadata.accounts?.get(row.socialAccountId);
        const prices = { ...(enriched?.prices ?? {}), ...(row.prices ?? {}) };
        // Proposal row scalar prices are canonical EUR, never another display currency.
        if (!Object.keys(prices).length && typeof row.publicPrice === "number") prices.EUR = row.publicPrice;
        return { ...row, accountId: row.socialAccountId, selectionId: new ObjectId().toHexString(),
            source: members.includes(row.socialAccountId) ? "offer" : "manual", prices, price: undefined, priceCurrency: undefined,
            selectedCampaignContentItem: Object.hasOwn(row, "selectedCampaignContentItem") ? row.selectedCampaignContentItem : row.selectedContent,
            ...(enriched && row.profileType === undefined ? { profileType: enriched.profileType } : {}),
        };
    });
    return { draftId: null, draftStep: null, campaignName, selectedCurrency: currencySymbol(currency),
        selectedAccounts, selectedPromoCardIds: selectedAccounts.filter((a: any) => a.source === "manual").map((a: any) => a.accountId),
        selectedOfferId: offer?.offerId ?? null, selectedOfferAccountIds: [...members], selectedOfferName: preview?.title ?? "",
        selectedOfferPrices: offer ? { ...offerPrices } : null, selectedOfferIsAvailable: offer ? preview?.isAvailable ?? true : null,
        selectedOfferUnavailableReason: preview?.unavailableReason ?? null,
        offerCatalogContext: preview?.catalogContext ?? (preview?.socialMedia && preview?.genre ? { platform: preview.socialMedia, genre: preview.genre } : null),
        campaignContent: serializeCampaignContent(content), totalPrice: 0,
    };
};

export const getProposalContentGroup = (social: string) => ["facebook", "instagram", "youtube", "tiktok"].includes(social) ? "main" : ["soundcloud", "spotify"].includes(social) ? "music" : "press";
const compatible = (account: any, content: any[]) => {
    const group = getProposalContentGroup(account.socialMedia);
    const candidates = content.filter((c) => c.socialMediaGroup === group && (group !== "main" || !account.profileType || c.profileType === account.profileType));
    const exact = candidates.filter((c) => c.socialMedia === account.socialMedia);
    return exact.length ? exact : candidates;
};
// Rescue's default applies only to genuinely new placements. Existing raw refs (including null/absent) are not rewritten.
export const initializeProposalAddContent = (accounts: any[], content: any[], snapshot: any) => {
    const missing = new Set<string>();
    const next = accounts.map((row) => {
        const ref = row.selectedCampaignContentItem;
        const persisted = row.addedAccountsId && snapshot.addedAccounts.some((a: any) => a.addedAccountsId === row.addedAccountsId);
        if (ref?.campaignContentItemId) {
            const item = content.find((c) => c._id === ref.campaignContentItemId);
            if (!item || (ref.descriptionId != null && !item.descriptions.some((d: any) => d._id === ref.descriptionId)) ||
                (ref.additionalBriefId != null && !item.additionalBrief.some((b: any) => b._id === ref.additionalBriefId))) throw new Error("A saved content reference is invalid. Review it in the source option.");
            return row;
        }
        if (persisted) return row;
        const item = compatible(row, content)[0];
        if (!item?.descriptions?.length) { missing.add(getProposalContentGroup(row.socialMedia)); return row; }
        return { ...row, selectedCampaignContentItem: { campaignContentItemId: item._id, descriptionId: item.descriptions[0]._id,
            ...(item.additionalBrief[0] ? { additionalBriefId: item.additionalBrief[0]._id } : {}) } };
    });
    return { accounts: next, missingGroups: [...missing] };
};

export const buildProposalAddWorkingResult = (builder: CampaignBuilderStore, state: any, context: ProposalAddSession, payload?: any) => {
    const snapshot = state.optionSnapshotsByIndex[context.optionIndex], current = state.accountsByOption[context.optionIndex] ?? [];
    assertProposalAddSource(snapshot, current);
    assertSupportedSelections(builder.selectedAccounts, Boolean(builder.selectedBundles.length || builder.unsupportedDraftBundles || builder.selectedAccounts.some((a: any) => a.campaignBundleId)));
    const original = new Map(current.map((a: any) => [a.addedAccountsId, a]));
    const existingContent = serializeCampaignContent(state.contentByOption[context.optionIndex] ?? []);
    const liveContentIds = new Set((payload?.addedAccounts ?? []).filter((a: any) => builder.selectedAccounts.some((r) => r.selectionId === a.selectionId && r.accountId === a.socialAccountId && !r.addedAccountsId && !r.selectedCampaignContentItem?.campaignContentItemId))
        .map((a: any) => a.selectedCampaignContentItem?.campaignContentItemId));
    const additions = payload ? serializeCampaignContent(payload.campaignContent).filter((c) => liveContentIds.has(c._id)) : [];
    if (additions.some((item) => existingContent.some((old) => old._id === item._id && JSON.stringify(old) !== JSON.stringify(item)))) throw new Error("A new content block collides with existing content identity.");
    const campaignContent = [...existingContent, ...additions.filter((c) => !existingContent.some((old) => old._id === c._id))];
    if (new Set(campaignContent.map((c) => c._id)).size !== campaignContent.length) throw new Error("Content identities are ambiguous.");
    let accounts = builder.selectedAccounts.map((row: any) => {
        const occurrence = context.placements.find((a) => a.selectionId === row.selectionId);
        if ((occurrence && (occurrence.addedAccountsId !== row.addedAccountsId || occurrence.accountId !== row.accountId || occurrence.influencerId !== row.influencerId || occurrence.socialMedia !== row.socialMedia)) ||
            (!occurrence && row.addedAccountsId)) throw new Error("A builder occurrence lost its Proposal placement identity.");
        const previous: any = row.addedAccountsId ? original.get(row.addedAccountsId) : undefined;
        if (row.addedAccountsId && (!previous || previous.socialAccountId !== row.accountId || previous.influencerId !== row.influencerId || previous.socialMedia !== row.socialMedia)) throw new Error("Proposal lifecycle identity cannot be reconciled.");
        const formRows = payload?.addedAccounts?.filter((a: any) => a.selectionId === row.selectionId) ?? [];
        if (formRows.length > 1) throw new Error("Content selection identity is ambiguous.");
        const form = !row.addedAccountsId && !row.selectedCampaignContentItem?.campaignContentItemId ? formRows[0] : undefined;
        if (form && form.socialAccountId !== row.accountId) throw new Error("Content selection refers to another account.");
        const selected = form ? form.selectedCampaignContentItem : row.selectedCampaignContentItem;
        return { ...(previous ?? {}), ...row, socialAccountId: row.accountId,
            ...(!row.addedAccountsId ? { isNewProposalPlacement: true } : {}),
            ...(row.addedAccountsId ? { addedAccountsId: row.addedAccountsId } : {}),
            dateRequest: form?.dateRequest ?? row.dateRequest ?? "ASAP", selectedCampaignContentItem: selected, selectedContent: selected };
    });
    const initialized = initializeProposalAddContent(accounts, campaignContent, snapshot);
    accounts = initialized.accounts;
    if (!accounts.length || initialized.missingGroups.length) throw new Error("Content is required for the new selections.");
    const selected = serializeSelectedOffer(builder.selectedOfferId ? { offerId: builder.selectedOfferId, selectedAccountIds: builder.selectedOfferAccountIds } : null, accounts);
    const before = effectiveProposalOffer(state, context.optionIndex);
    const sameCatalogue = selected?.offerId === before?.offerId && JSON.stringify([...(selected?.selectedAccountIds ?? [])].sort()) === JSON.stringify([...(before?.selectedAccountIds ?? [])].sort());
    // Reselecting the same catalogue Offer creates new occurrences. Only surviving entry
    // placements can preserve omission or the lifecycle links of an existing explicit change.
    const samePlacements = !selected || selected.selectedAccountIds.every((id) => {
        const row = accounts.find((a) => a.socialAccountId === id);
        return row && context.placements.some((entry) => entry.selectionId === row.selectionId &&
            entry.accountId === id && entry.addedAccountsId === row.addedAccountsId);
    });
    const change = sameCatalogue && samePlacements ? state.selectedOfferChangeByOption[context.optionIndex] : selected;
    const body = buildProposalOptionPatchBody({ snapshot, accounts, content: campaignContent, selectedOfferChange: change });
    // Validate before committing; the real Save handler owns PATCH and authoritative GET.
    for (const row of body.addedAccounts) if (row.selectedCampaignContentItem) serializeContentReference(row.selectedCampaignContentItem, campaignContent);
    return { accounts, campaignContent, selectedOfferChange: change,
        offerPreview: selected ? { offerId: selected.offerId, title: builder.selectedOfferName, prices: builder.selectedOfferPrices,
            isAvailable: builder.selectedOfferIsAvailable, catalogContext: builder.offerCatalogContext } : null };
};

import { ObjectId } from "bson";
import type { Bundle } from "../../bundle/model/bundle.types";
import type { CampaignBuilderActions, CampaignBuilderState, SelectedCampaignAccount, SelectedBundleSnapshot } from "./campaign-builder.types";

export const createSelectedBundleSnapshot = (bundle: Bundle): SelectedBundleSnapshot => structuredClone(bundle);
export const getSelectedBundleIds = (bundles: readonly SelectedBundleSnapshot[]) => new Set(bundles.map((b) => b.bundleId));
export const getSelectedBundleAccountIds = (bundles: readonly SelectedBundleSnapshot[]) => new Set(bundles.flatMap((b) => b.accounts.map((a) => a.accountId)));
export const isBundleFullyIncludedInOffer = (bundle: Bundle, ids: readonly string[]) =>
    bundle.accounts.length > 0 && bundle.accounts.every((a) => !!a.accountId.trim() && ids.includes(a.accountId));
export const doesBundleOverlapSelectedBundles = (bundle: Bundle, bundles: readonly SelectedBundleSnapshot[]) => {
    const ids = getSelectedBundleAccountIds(bundles.filter((b) => b.bundleId !== bundle.bundleId));
    return bundle.accounts.some((a) => ids.has(a.accountId));
};

// Runtime rows are placements, not a Map<accountId,row>. Preserve every existing occurrence.
// A new catalogue member gets one row; Draft occurrence reconciliation is a later transport stage.
export const normalizeSelectedAccounts = ({ currentAccounts, selectedPromoCardIds, selectedOfferAccountIds, offerAccounts, selectedBundles }: {
    currentAccounts: readonly SelectedCampaignAccount[];
    selectedPromoCardIds: readonly string[];
    selectedOfferAccountIds: readonly string[];
    offerAccounts: readonly SelectedCampaignAccount[];
    selectedBundles: readonly SelectedBundleSnapshot[];
}): SelectedCampaignAccount[] => {
    const catalogue = [...offerAccounts, ...selectedBundles.flatMap((b) => b.accounts)];
    const ids = new Set([...currentAccounts.map((a) => a.accountId), ...selectedOfferAccountIds, ...getSelectedBundleAccountIds(selectedBundles)]);
    return [...ids].flatMap((id) => {
        const bundle = selectedBundles.find((b) => b.accounts.some((a) => a.accountId === id));
        const source = selectedOfferAccountIds.includes(id) ? "offer" : bundle ? "bundle" : selectedPromoCardIds.includes(id) ? "manual" : null;
        if (!source) return [];
        const candidate = catalogue.find((a) => a.accountId === id);
        const existing = currentAccounts.filter((a) => a.accountId === id);
        const rows: SelectedCampaignAccount[] = existing.length ? existing : candidate ? [{ ...candidate,
            profileType: candidate.profileType === "creator" || candidate.profileType === "community" ? candidate.profileType : undefined,
            dateRequest: "ASAP" }] : [];
        return rows.map((row) => ({
            ...row,
            // Presentation and currency maps come from the current catalogue; workflow stays on the placement.
            ...Object.fromEntries((["countries", "communityMusicGenres", "communityThemeTopics", "creatorMusicGenres", "creatorContentFocus"] as const)
                .filter((key) => candidate?.[key] !== undefined).map((key) => [key, structuredClone(candidate![key])])),
            ...(candidate?.prices ? { prices: { ...candidate.prices }, price: undefined, priceCurrency: undefined } : {}),
            ...(candidate && source !== "manual" ? { isAvailable: true, unavailableReason: undefined } : {}),
            selectionId: row.selectionId ?? new ObjectId().toHexString(),
            source,
            bundleId: bundle?.bundleId,
        }));
    });
};

export const selectOfferFromCampaignSelection = (state: CampaignBuilderState, payload: Parameters<CampaignBuilderActions["selectOffer"]>[0]): Partial<CampaignBuilderState> => {
    const removing = !payload.offerId || state.selectedOfferId === payload.offerId;
    // Full membership is the union of declared IDs and connected account data, never a filtered visible subset.
    const ids = removing ? [] : [...new Set([...(payload.accountIds ?? []), ...(payload.accounts ?? []).map((a) => a.accountId)])];
    const selectedBundles = removing ? state.selectedBundles : state.selectedBundles.filter((b) => !isBundleFullyIncludedInOffer(b, ids));
    const selectedPromoCardIds = state.selectedPromoCardIds.filter((id) => !ids.includes(id) && !state.selectedOfferAccountIds.includes(id));
    return {
        selectedOfferId: removing ? null : payload.offerId,
        selectedOfferName: removing ? "" : payload.offerName ?? "",
        selectedOfferPrices: removing ? null : payload.offerPrices ? { ...payload.offerPrices } : typeof payload.offerPrice === "number" ? { EUR: payload.offerPrice } : null,
        selectedOfferIsAvailable: removing ? null : true,
        selectedOfferUnavailableReason: null,
        offerCatalogContext: removing ? null : payload.catalogContext ?? null,
        selectedOfferAccountIds: ids,
        selectedOfferAccounts: removing ? [] : structuredClone(payload.accounts ?? []),
        selectedBundles, selectedPromoCardIds,
        selectedAccounts: normalizeSelectedAccounts({ currentAccounts: state.selectedAccounts, selectedPromoCardIds,
            selectedOfferAccountIds: ids, offerAccounts: payload.accounts ?? [], selectedBundles }),
    };
};

// Internal model helper only. User actions must check the static gate before invoking it.
export const selectBundleFromCampaignSelection = (state: CampaignBuilderState, bundle: Bundle): Partial<CampaignBuilderState> | null => {
    const ids = bundle.accounts.map((a) => a.accountId);
    if (!bundle.bundleId.trim() || !ids.length || ids.some((id) => !id.trim()) || new Set(ids).size !== ids.length ||
        getSelectedBundleIds(state.selectedBundles).has(bundle.bundleId) || doesBundleOverlapSelectedBundles(bundle, state.selectedBundles) ||
        (state.selectedOfferId && isBundleFullyIncludedInOffer(bundle, state.selectedOfferAccountIds))) return null;
    const selectedBundles = [...state.selectedBundles, createSelectedBundleSnapshot(bundle)];
    const selectedPromoCardIds = state.selectedPromoCardIds.filter((id) => !ids.includes(id));
    return { selectedBundles, selectedPromoCardIds, selectedAccounts: normalizeSelectedAccounts({
        currentAccounts: state.selectedAccounts, selectedPromoCardIds, selectedOfferAccountIds: state.selectedOfferAccountIds,
        offerAccounts: state.selectedOfferAccounts, selectedBundles,
    }) };
};

export const removeBundleFromCampaignSelection = (state: CampaignBuilderState, bundleId: string): Partial<CampaignBuilderState> => {
    const selectedBundles = state.selectedBundles.filter((b) => b.bundleId !== bundleId);
    return { selectedBundles, selectedAccounts: normalizeSelectedAccounts({ currentAccounts: state.selectedAccounts,
        selectedPromoCardIds: state.selectedPromoCardIds, selectedOfferAccountIds: state.selectedOfferAccountIds,
        offerAccounts: state.selectedOfferAccounts, selectedBundles }) };
};

export type SelectedOffer = {
    offerId: string;
    selectedAccountIds: string[];
};

export type DraftSelectedOffer = SelectedOffer & {
    title?: string | null;
    socialMedia?: string | null;
    genre?: string | null;
    prices: OfferPrices;
    currentAccountIds: string[];
    isAvailable: boolean;
    unavailableReason?: string | null;
};

export type OfferPrices = { EUR: number; USD: number; GBP: number };
export type DisplayCurrency = keyof OfferPrices;
export const currencyCode = (value: string): DisplayCurrency =>
    value === "USD" || value === "$" ? "USD" : value === "GBP" || value === "£" ? "GBP" : "EUR";
export const currencySymbol = (value: string) => ({ EUR: "€", USD: "$", GBP: "£" })[currencyCode(value)];

export class OfferSelectionError extends Error {
    constructor(message = "Please review your selected offer and refresh the catalogue.") {
        super(message);
        this.name = "OfferSelectionError";
    }
}

export const getBuilderSelectedOffer = (state: {
    unsupportedDraftBundles?: boolean;
    selectedAccounts?: readonly { source?: string; bundleId?: string }[];
    selectedOfferId: string | null;
    selectedOfferAccountIds: string[];
}): SelectedOffer | null => {
    assertSupportedSelections(state.selectedAccounts ?? [], state.unsupportedDraftBundles);
    if (state.selectedOfferId === null) {
        if (state.selectedOfferAccountIds.length) throw new OfferSelectionError();
        return null;
    }
    return {
        offerId: state.selectedOfferId,
        selectedAccountIds: state.selectedOfferAccountIds,
    };
};

// Validate against the final mapped rows. Never infer or trim offer membership.
export const serializeSelectedOffer = (
    selection: SelectedOffer | null | undefined,
    addedAccounts: readonly { socialAccountId: string; influencerId?: string; socialMedia?: string }[],
    isAvailable?: boolean | null,
): SelectedOffer | null => {
    if (selection == null) return null;
    const { offerId, selectedAccountIds } = selection;
    if (isAvailable === false) {
        throw new OfferSelectionError("Your saved offer is unavailable or has changed. Refresh the catalogue and review your selection.");
    }
    if (typeof offerId !== "string" || !offerId.trim() ||
        !Array.isArray(selectedAccountIds) || !selectedAccountIds.length ||
        selectedAccountIds.some((id) => typeof id !== "string" || !id.trim()) ||
        new Set(selectedAccountIds).size !== selectedAccountIds.length) {
        throw new OfferSelectionError();
    }
    for (const id of selectedAccountIds) {
        const rows = addedAccounts.filter((account) => account.socialAccountId === id);
        if (rows.length !== 1 || !rows[0].influencerId?.trim() || !rows[0].socialMedia?.trim()) {
            throw new OfferSelectionError("Some accounts in your selected offer are missing or ambiguous. Please review the offer selection.");
        }
    }
    return { offerId, selectedAccountIds: [...selectedAccountIds] };
};

export const getDraftRowIds = (account: { selectionId?: string }) => ({
    ...(account.selectionId ? { selectionId: account.selectionId } : {}),
});

export const assertSupportedSelections = (rows: readonly { source?: string; bundleId?: string }[], hasBundles = false) => {
    if (hasBundles || rows.some((row) => row.source === "bundle" || row.bundleId)) {
        throw new OfferSelectionError("This draft contains bundles which this builder cannot edit. No selections were changed or submitted.");
    }
};

export const serializeDraftSelection = <T extends { socialAccountId: string; source?: string; offerId?: string; bundleId?: string }>(
    addedAccounts: T[],
    selection: SelectedOffer | null,
) => {
    const selectedOffer = serializeSelectedOffer(selection, addedAccounts);
    assertSupportedSelections(addedAccounts);
    const membership = new Set(selectedOffer?.selectedAccountIds ?? []);
    return {
        selectedOffer,
        addedAccounts: addedAccounts.map((account) => {
            const row = { ...account };
            delete row.offerId;
            delete row.bundleId;
            return membership.has(row.socialAccountId)
                ? { ...row, source: "offer", offerId: selectedOffer!.offerId }
                : { ...row, source: "standalone" };
        }),
    };
};

export const isInvalidOfferError = (error: unknown): boolean => {
    const reason = (error as { response?: { status?: number; data?: { invalidOffer?: { reason?: string } } } })
        ?.response?.data?.invalidOffer?.reason;
    return (error as { response?: { status?: number } })?.response?.status === 400 &&
        typeof reason === "string" && reason.length > 0;
};

import type { SelectedCampaignAccount } from "./campaign-builder.types";
import { currencyCode, type OfferPrices } from "./selected-offer";

export type BuildCampaignOffer = { id: string; price: number };

export const priceForCurrency = (
    prices: Partial<OfferPrices> | undefined | null, currency: string,
): number | null => {
    const value = prices?.[currencyCode(currency)];
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
};

// Converted GET maps are used as-is. A scalar catalogue price is EUR only.
// NaN means "not ready", never a display amount or a price to submit.
export const calcBuilderTotal = ({
    selectedOfferId, offers = [], selectedAccounts, selectedOfferAccountIds = [],
    selectedOfferPrices, selectedCurrency = "EUR", selectedBundles = [],
}: {
    selectedOfferId: string | null;
    offers?: BuildCampaignOffer[];
    selectedAccounts: SelectedCampaignAccount[];
    selectedOfferAccountIds?: string[];
    selectedOfferPrices?: Partial<OfferPrices> | null;
    selectedOfferPrice?: number | null;
    selectedCurrency?: string;
    selectedBundles?: readonly unknown[];
}) => {
    // Bundle allocation/quote transport is a later stage. Never price these rows as standalone.
    if (selectedBundles.length || selectedAccounts.some((a) => a.source === "bundle" || a.bundleId)) return NaN;
    const code = currencyCode(selectedCurrency);
    const membership = new Set(selectedOfferId ? selectedOfferAccountIds : []);
    const catalogue = offers.find((offer) => offer.id === selectedOfferId);
    const offerPrice = selectedOfferId ? priceForCurrency(selectedOfferPrices, code) ??
        (code === "EUR" ? catalogue?.price ?? NaN : NaN) : 0;
    return offerPrice + selectedAccounts.reduce((sum, account) => {
        const price = priceForCurrency(account.prices, code) ??
            (account.priceCurrency === code ? account.price ?? NaN : NaN);
        return sum + (membership.has(account.accountId) ? 0 : price);
    }, 0);
};

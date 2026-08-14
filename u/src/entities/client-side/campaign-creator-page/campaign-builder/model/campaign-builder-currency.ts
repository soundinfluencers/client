import type {
    CampaignBuilderState,
    CampaignCurrencyMissingPrices,
    CampaignCurrencySwitchResult,
    SelectedCampaignAccount,
} from "./campaign-builder.types";
import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";
import {
    calculateCampaignSelectionTotal,
} from "./campaign-builder-selection";
import {
    CAMPAIGN_CURRENCY_OPTIONS,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/build-campaign-params.constants";

type CurrencySwitchState = Pick<
    CampaignBuilderState,
    | "selectedOfferId"
    | "selectedOfferPrices"
    | "selectedOfferAccountIds"
    | "selectedAccounts"
    | "selectedBundles"
>;

export type CampaignCurrencySwitchPatch = Pick<
    CampaignBuilderState,
    | "selectionCurrency"
    | "selectedCurrency"
    | "selectedOfferPrice"
    | "selectedAccounts"
    | "totalPrice"
>;

export type BuiltCampaignCurrencySwitch =
    | {
        result: { ok: true };
        patch: CampaignCurrencySwitchPatch;
    }
    | {
        result: Extract<CampaignCurrencySwitchResult, { ok: false }>;
        patch: null;
    };

const isValidPrice = (value: unknown): value is number =>
    Number.isInteger(value) && Number(value) >= 0;

const unique = (values: string[]): string[] => [...new Set(values)];

const getMissingPrices = (
    state: CurrencySwitchState,
    currency: CampaignCurrencyCode,
): CampaignCurrencyMissingPrices => {
    const selectedOfferAccountIds = new Set(
        state.selectedOfferAccountIds,
    );
    const overlapAccountIds: string[] = [];

    state.selectedBundles.forEach((bundle) => {
        bundle.accounts.forEach((account) => {
            if (
                selectedOfferAccountIds.has(account.accountId) &&
                !isValidPrice(account.prices[currency])
            ) {
                overlapAccountIds.push(account.accountId);
            }
        });
    });

    return {
        offerIds:
            state.selectedOfferId &&
            !isValidPrice(state.selectedOfferPrices[currency])
                ? [state.selectedOfferId]
                : [],
        bundleIds: state.selectedBundles
            .filter((bundle) => !isValidPrice(bundle.prices[currency]))
            .map((bundle) => bundle.bundleId),
        accountIds: state.selectedAccounts
            .filter(
                (account) =>
                    account.source === "manual" &&
                    !isValidPrice(account.prices?.[currency]),
            )
            .map((account) => account.accountId),
        overlapAccountIds: unique(overlapAccountIds),
    };
};

const hasMissingPrices = (
    missing: CampaignCurrencyMissingPrices,
): boolean =>
    missing.offerIds.length > 0 ||
    missing.bundleIds.length > 0 ||
    missing.accountIds.length > 0 ||
    missing.overlapAccountIds.length > 0;

const mapManualAccountPrice = (
    account: SelectedCampaignAccount,
    currency: CampaignCurrencyCode,
): SelectedCampaignAccount =>
    account.source === "manual"
        ? {
            ...account,
            price: account.prices![currency]!,
        }
        : account;

export const buildCampaignCurrencySwitch = (
    state: CurrencySwitchState,
    targetCurrency: CampaignCurrencyCode,
): BuiltCampaignCurrencySwitch => {
    const missing = getMissingPrices(state, targetCurrency);

    if (hasMissingPrices(missing)) {
        return {
            result: {
                ok: false,
                targetCurrency,
                missing,
            },
            patch: null,
        };
    }

    const selectedOfferPrice = state.selectedOfferId
        ? state.selectedOfferPrices[targetCurrency]
        : undefined;
    const selectedAccounts = state.selectedAccounts.map((account) =>
        mapManualAccountPrice(account, targetCurrency),
    );
    const totalPrice = calculateCampaignSelectionTotal({
        offerPrice: selectedOfferPrice ?? 0,
        selectedAccounts,
        selectedBundles: state.selectedBundles,
        selectedOfferAccountIds: state.selectedOfferAccountIds,
        currency: targetCurrency,
    });
    const currencyOption = CAMPAIGN_CURRENCY_OPTIONS.find(
        (option) => option.currency === targetCurrency,
    );

    if (!currencyOption || !Number.isInteger(totalPrice) || totalPrice < 0) {
        return {
            result: {
                ok: false,
                targetCurrency,
                missing,
            },
            patch: null,
        };
    }

    return {
        result: { ok: true },
        patch: {
            selectionCurrency: targetCurrency,
            selectedCurrency: currencyOption.key,
            selectedOfferPrice,
            selectedAccounts,
            totalPrice,
        },
    };
};

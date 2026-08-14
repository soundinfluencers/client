export const CAMPAIGN_DISPLAY_CURRENCIES = ["EUR", "USD", "GBP"] as const;

export type CampaignDisplayCurrency =
    (typeof CAMPAIGN_DISPLAY_CURRENCIES)[number];

export type DisplayCurrency = CampaignDisplayCurrency | string;

const currencySymbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
};

export const formatCurrency = (
    value?: number | string | null,
    currency?: DisplayCurrency,
) => {
    const amount = Number(value ?? 0);
    const symbol = currencySymbols[currency ?? "EUR"] ?? currency ?? "€";

    return `${amount}${symbol}`;
};

export const isCampaignDisplayCurrency = (
    value: unknown,
): value is CampaignDisplayCurrency =>
    typeof value === "string" &&
    CAMPAIGN_DISPLAY_CURRENCIES.includes(value as CampaignDisplayCurrency);

export const getCampaignCurrencySymbol = (
    currency: CampaignDisplayCurrency,
) => currencySymbols[currency];

export const formatPersistedCampaignCurrency = (
    value: number | string | null | undefined,
    currency: unknown,
) => {
    if (!isCampaignDisplayCurrency(currency)) return "—";

    return `${value ?? 0}${getCampaignCurrencySymbol(currency)}`;
};

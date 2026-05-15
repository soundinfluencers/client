export type DisplayCurrency = "EUR" | "USD" | "GBP" | string;

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
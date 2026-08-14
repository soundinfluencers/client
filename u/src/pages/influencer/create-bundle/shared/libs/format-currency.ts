type TCurrency = "EUR" | "USD" | "GBP";

const CURRENCY_SYMBOL: Record<TCurrency, string> = {
  EUR: "\u20AC",
  USD: "\u0024",
  GBP: "\u00A3",
};

export const formatCurrency = (
  value: number | string,
  currency: TCurrency = 'EUR',
): string => {
  const amount = Number(value);

  if (Number.isNaN(amount)) return "—";

  return `${amount}${CURRENCY_SYMBOL[currency]}`;
};

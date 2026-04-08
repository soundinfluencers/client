export const getPriceByCurrency = (
    prices: Record<string, number>,
    selectedCurrency: { currency: string },
) => {
  const price = prices[selectedCurrency.currency] ?? 0;
  return Math.round(price);
};
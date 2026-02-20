export const pickPrice = (prices: any) => {
  if (!prices || typeof prices !== "object") {
    const n = Number(prices ?? 0);
    return { amount: n, currency: "UNKNOWN" as const };
  }

  const eur = Number(prices.EUR ?? 0);
  if (eur > 0) return { amount: eur, currency: "EUR" as const };

  const usd = Number(prices.USD ?? 0);
  if (usd > 0) return { amount: usd, currency: "USD" as const };

  const gbp = Number(prices.GBP ?? 0);
  if (gbp > 0) return { amount: gbp, currency: "GBP" as const };

  const entry = Object.entries(prices).find(([, v]) => Number(v) > 0);
  if (entry) return { amount: Number(entry[1]), currency: entry[0] as any };

  return { amount: 0, currency: "UNKNOWN" as const };
};

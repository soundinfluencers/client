import type { Prices } from "@/types/client/creator-campaign/creator-campaign.types";

export const getPriceByCurrency = (
  pricesObj: Prices,
  selectedCurrency: { currency: string },
) => {
  const key = selectedCurrency.currency as keyof Prices;
  const price = pricesObj[key] ?? 0;
  return Math.round(price * 100) / 100;
};

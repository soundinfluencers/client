import type { Prices } from "@/types/client/creator-campaign/creator-campaign.types";

export const getPriceByCurrency = (
  pricesObj: Prices,
  selectedCurrency: { currency: string }
) => {
  const key = selectedCurrency.currency as keyof Prices; // говорим TS, что это ключ Prices
  return pricesObj[key] ?? 0;
};

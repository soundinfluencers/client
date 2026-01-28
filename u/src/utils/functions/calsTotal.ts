import type {
  IApiOffer,
  IPromoCard,
} from "../../types/client/creator-campaign/creator-campaign.types";

const getEurPrice = (prices: unknown): number => {
  if (prices && typeof prices === "object") {
    const eur = (prices as any).EUR;
    return Number(eur) || 0;
  }
  return Number(prices) || 0;
};

const getOfferAccountIds = (offer: IApiOffer | null): Set<string> => {
  const ids = new Set<string>();
  const accounts = (offer as any)?.connectedAccounts ?? [];
  for (const a of accounts) {
    const id = String(a?.accountId ?? "");
    if (id) ids.add(id);
  }
  return ids;
};

export const calcTotal = (offer: IApiOffer | null, cards: IPromoCard[]) => {
  const offerPrice = Number(offer?.price) || 0;

  const offerIds = getOfferAccountIds(offer);

  const promoPrice = cards.reduce((sum, c) => {
    const id = String((c as any)?.accountId ?? "");
    if (id && offerIds.has(id)) return sum;
    return sum + getEurPrice((c as any)?.prices);
  }, 0);

  return offerPrice + promoPrice;
};

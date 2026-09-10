
type PricedAccount = { accountId: string; prices: { EUR?: number } };
type PricedOffer = { price: number; connectedAccounts: { accountId: string }[] };

const getEurPrice = (prices: unknown): number => {
  if (prices && typeof prices === "object") {
    const eur = ("EUR" in prices ? prices.EUR : undefined);
    return Number(eur) || 0;
  }
  return Number(prices) || 0;
};

const getOfferAccountIds = (offer: PricedOffer | null): Set<string> => {
  const ids = new Set<string>();
  const accounts = offer?.connectedAccounts ?? [];
  for (const a of accounts) {
    const id = String(a?.accountId ?? "");
    if (id) ids.add(id);
  }
  return ids;
};

export const calcTotal = (offer: PricedOffer | null, cards: PricedAccount[]) => {
  const offerPrice = Number(offer?.price) || 0;

  const offerIds = getOfferAccountIds(offer);

  const promoPrice = cards.reduce((sum, c) => {
    const id = String(c.accountId ?? "");
    if (id && offerIds.has(id)) return sum;
    return sum + getEurPrice(c.prices);
  }, 0);

  return offerPrice + promoPrice;
};

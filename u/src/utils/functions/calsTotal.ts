import type {
  ApiOffer,
  PromoCard,
} from "../../types/creator-campaign/creator-campaign.types";

export const calcTotal = (offer: ApiOffer | null, cards: PromoCard[]) => {
  const offerPrice = offer ? offer.price : 0;

  const promoPrice = cards.reduce((sum, c) => sum + (Number(c.price) || 0), 0);

  return offerPrice + promoPrice;
};

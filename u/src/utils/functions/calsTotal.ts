import type {
  IApiOffer,
  IPromoCard,
} from "../../types/creator-campaign/creator-campaign.types";

export const calcTotal = (offer: IApiOffer | null, cards: IPromoCard[]) => {
  const offerPrice = offer ? offer.price : 0;

  const promoPrice = cards.reduce((sum, c) => sum + (Number(c.price) || 0), 0);

  return offerPrice + promoPrice;
};

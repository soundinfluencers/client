export const useSelectedPlatforms = (offer?: any, promoCard?: any[]) => {
  const offerPlatforms: string[] = offer?.socialMedia
    ? Array.isArray(offer.socialMedia)
      ? offer.socialMedia
      : [offer.socialMedia]
    : [];

  const promoPlatforms: string[] = promoCard?.map((p) => p.socialMedia) || [];

  return [...new Set([...offerPlatforms, ...promoPlatforms])];
};

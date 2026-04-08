import type {ConnectedAccount, Offer} from "@/client-side/types/offers.ts";
import type {SocialMedia} from "@/client-side/types/common.ts";


export const useSelectedPlatforms = (
    offer?: Offer | null,
    promoCard?: ConnectedAccount[],
): SocialMedia[] => {
  const offerPlatforms: SocialMedia[] = offer?.socialMedia
      ? Array.isArray(offer.socialMedia)
          ? offer.socialMedia
          : [offer.socialMedia]
      : [];

  const promoPlatforms: SocialMedia[] =
      promoCard?.map((promo) => promo.socialMedia as SocialMedia) ?? [];

  return [...new Set([...offerPlatforms, ...promoPlatforms])];
};
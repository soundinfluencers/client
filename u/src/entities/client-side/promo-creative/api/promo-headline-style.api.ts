import $api from "@/api/api.ts";
import {
  PROMO_IMAGE_FILTERS,
  type PromoAccentMode,
  type PromoCtaPosition,
  type PromoImageTreatment,
  type PromoLayout,
  type PromoStyle,
  type PromoTypography,
} from "@/entities/client-side/promo-creative/model/promo-creative.model.ts";

type PromoHeadlineStyleDto = {
  id: string;
  name: string;
  description: string;
  sampleHeadline: string;
  layout: PromoLayout;
  typography: PromoTypography;
  accentMode: PromoAccentMode;
  imageTreatment: PromoImageTreatment;
  ctaPosition: PromoCtaPosition;
  ctaLabel: string;
  background: string;
  accent: string;
  foreground: string;
  overlayStrength: number;
  uppercase: boolean;
};

export const listPromoHeadlineStyles = async (): Promise<PromoStyle[]> => {
  const response = await $api.get("/promo-headline-styles");
  const payload = response.data.data as PromoHeadlineStyleDto[];
  return payload.map((style) => ({
    ...style,
    filter: PROMO_IMAGE_FILTERS[style.imageTreatment],
  }));
};

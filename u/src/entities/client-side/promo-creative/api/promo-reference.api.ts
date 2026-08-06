import $api from "@/api/api.ts";
import type { PromoReference } from "../model/promo-creative.model.ts";

type PromoReferenceDto = {
  id: string;
  name: string;
  previewUrl: string;
  styleBrief: string;
};

// Admin-managed looks. An empty list is a normal state — the studio then shows the
// built-in reference instead of an empty picker.
export const listPromoReferences = async (): Promise<PromoReference[]> => {
  const response = await $api.get("/promo-references");
  const payload = (response.data.data ?? []) as PromoReferenceDto[];
  return payload.map((reference) => ({
    id: reference.id,
    name: reference.name,
    preview: reference.previewUrl,
    styleBrief: reference.styleBrief,
  }));
};
